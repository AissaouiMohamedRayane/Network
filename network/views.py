from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
import json 
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator


from .models import User, Post, Comment


def index(request, display=None):
    if request.method=="POST":
        text=request.POST["text"]
        user=request.user
        post=Post(user=user, text=text )
        post.save()
        return HttpResponseRedirect(reverse("index"))
    if display=='':
        posts=Post.objects.all()
    else:
        users=request.user.following.all()
        posts=[]
        for user in users:
            posts=posts+list(user.post.all())
            last_post_id = request.GET.get('last_post_id')
    
    posts_queryset = Post.objects.all().order_by('-date')
    
    paginator = Paginator(posts_queryset, 10)
    
    if last_post_id:
        try:
            page_number = paginator.get_page_number(Post.objects.get(id=last_post_id))
        except Post.DoesNotExist:
            page_number = 1
    else:
        page_number = 1
    
    posts_page = paginator.page(page_number)
    return render(request, "network/index.html", {
        "Posts":posts,
        "class":display
    })
    
def users(request, username):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    user=User.objects.get(username=username)
    return render(request, "network/users.html",{
        "user_page":user,
        "following":user.count_following(),
        "followres":user.count_followres(),
        "Posts":Post.objects.filter(user=user),
        "is_followed":request.user.is_followed(user),
    })

def get_comments(request, id):
    comments=Comment.objects.filter(post=id)
    if comments:
        return JsonResponse([comment.serialize() for comment in comments], safe=False)
    else:
        return JsonResponse({
            "message":'No Comment'
        })
@login_required
def add_comment(request, id):
    if request.method !='POST':
        return JsonResponse({
            'error':"Only POST request"
        })
    data = json.loads(request.body)
    text = data.get('text')
    post=Post.objects.get(pk=id)
    comment=Comment(user=request.user, text=text, post=post)
    comment.save()
    return JsonResponse({'id': comment.pk,}, status=200)

    
    
    

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, email=email, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["email"]
        email = request.POST["username"] 

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
@login_required
def follow(request, id):
    user=User.objects.get(pk=id)
    response=request.user.follow( user)
    if response:
        return JsonResponse({
            "message":"followed successfully"
        },status=200)
    else:
        return JsonResponse({
            "message":"An error occurred while trying to follow user"
        },status=500)
@login_required
def unfollow(request, id):
    user=User.objects.get(pk=id)
    response=request.user.unfollow(user)
    if response:
        return JsonResponse({
            "message":"unfollowed successfully"
        },status=200)
    else:
        return JsonResponse({
            "message":"An error occurred while trying to unfollow user"
        },status=500)
        
@login_required
def get_followres(request, username):
    try:
        user = get_object_or_404(User, username=username)
        follows = user.followres.all()
        followers_data = [{'username': follower.username} for follower in follows]
        return JsonResponse(followers_data, safe=False)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

@login_required
def get_following(request, username):
    try:
        user = get_object_or_404(User, username=username)
        follows = user.following.all()
        followers_data = [{'username': follower.username} for follower in follows]
        return JsonResponse(followers_data, safe=False)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
def my_button(request):
    users=User.objects.all()
    for user in users:
        for u in users:
            if user.is_followed(u):
                u.followres.add(user)
def like(request, id, post_id):
    post=Post.objects.get(id=post_id)
    response=post.liked_by(request.user)
    if response:
        return JsonResponse({
            "message":"Liked successfully"
        }, status=200)
    else:
        return JsonResponse({
            'message':"error while successfully"
        }, status=500)
def dislike(request, id, post_id):
    post=Post.objects.get(pk=post_id)
    response=post.disliked_by(request.user)
    if response:
        return JsonResponse({
            "message":"Liked successfully"
        }, status=200)
    else:
        return JsonResponse({
            'message':"error while liking"
        }, status=500)

@login_required
def search(request):
    data=json.loads(request.body)
    user=data.get('user')
    users=[]
    i=0
    for u in User.objects.all():
        if user.lower() in u.username.lower():
            i=i+1
            users.append(u)
    if i==0:
        return JsonResponse({
            'message':'No user with this name'
        }, status=200)
    return JsonResponse([user.serialize() for user in users], safe=False, status=200)

def user_liked_comment(request, id):
    comment = get_object_or_404(Comment, pk=id)
    user_liked = comment.liked_users.filter(pk=request.user.pk).exists()
    return JsonResponse({'response': user_liked})

def like_comment(request, id):
    comment = Comment.objects.get(pk=id)
    response = comment.liked_by(request.user)
    if response:
        return JsonResponse({
            'message':'Liked successfully'
        }, status=200)
    return JsonResponse({
        'message':'error while liking'
    }, status=500)

def dislike_comment(request, id):
    comment = Comment.objects.get(pk=id)
    response = comment.disliked_by(request.user)
    if response:
        return JsonResponse({
            'message':'Disliked successfully'
        }, status=200)
    return JsonResponse({
        'message':'error while disliking'
    }, status=500)