
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("comments/<int:id>", views.get_comments, name="comments"),
    path("add_comments/<int:id>", views.add_comment, name='add_comments'),
    path("users/<str:username>", views.users, name="users"),
    path("follow/<int:id>", views.follow, name='follow'),
    path("unfollow/<int:id>", views.unfollow, name='unfollow'),
    path('get_followres/<str:username>', views.get_followres, name='get_followres'),
    path('get_following/<str:username>', views.get_following, name='get_following'),
    path('following', views.index_following, name='index_following'),
    path('sddd', views.my_button, name='my_button')
]
