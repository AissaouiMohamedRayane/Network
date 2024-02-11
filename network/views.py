from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
import json
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post, Comment


def index(request):
    if request.method=="POST":
        text=request.POST["text"]
        user=request.user
        post=Post(user=user, text=text )
        post.save()
        return HttpResponseRedirect(reverse("index"))
    return render(request, "network/index.html", {
        "Posts":Post.objects.all()
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
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required."}, status=400)

    try:
        post = Post.objects.get(pk=id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    try:
        data = json.loads(request.body)
        text = data.get('text')
        comment = Comment(user=request.user, text=text, post=post)
        comment.save()
        return JsonResponse({'message': "Comment added successfully."}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format in request body."}, status=400)
    
    
    

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
        username = request.POST["username"]
        email = request.POST["email"]

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
