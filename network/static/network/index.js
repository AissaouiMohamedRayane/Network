document.addEventListener("DOMContentLoaded", () => {
  fetch("get_posts")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      const button = document.querySelector("#follow_button");
      if (button) {
        button.onclick = follow;
      }
      const followed = document.querySelector("#follow");
      if (followed) {
        const children = Array.from(followed.children);
        children.forEach((li) => {
          li.onclick = show_follow;
        });
      }
      const likes = document.querySelectorAll("#like_button");
      if (likes) {
        likes.forEach((likee) => {
          likee.onclick = like;
        });
      }
      const search_form = document.querySelector("#search_form");
      if (search_form) {
        search();
      }
      document.querySelectorAll(".comment").forEach((comment) => {
        comment.onclick = () => {
          id = parseInt(comment.dataset.id);
          const dive = comment.parentElement;
          const existing_div = dive.querySelector("#comment_div");
          const form = dive.querySelector("#comment_form");
          if (existing_div) {
            existing_div.remove();
            form.classList.add("display_none");
          } else {
            form.classList.remove("display_none");
            const div = document.createElement("div");
            div.id = "comment_div";
            const h2 = document.createElement("h2");
            h2.innerHTML = "Comments:";
            h2.id = "comment_h2";
            div.appendChild(h2);
            form.onsubmit = (event) => {
              event.preventDefault();
              const csrftoken = getCookie("csrftoken");
              const texterea = dive.querySelector("#comment_texterea");
              const button = document.createElement("button");
              const span = document.createElement("span");
              span.className = "flex";
              const h1 = document.createElement("h1");
              fetch(`http://127.0.0.1:8000/add_comments/${id}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRFToken": csrftoken,
                },
                body: JSON.stringify({
                  text: texterea.value,
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  const id = data.id;
                  button.dataset.id = id;
                  h1.innerHTML = "0";
                });
              const ul = document.querySelector("#comment_ul");
              if (!ul) {
                const ul = document.createElement("ul");
                ul.id = "comment_ul";
              }
              const li = document.createElement("li");
              li.innerHTML = `${texterea.dataset.username} said:<br>${texterea.value}`;
              li.className = "overflow";

              button.innerHTML = "like";
              button.classList = "btn btn-sm btn-outline-primary follow_button";
              ul.appendChild(li);
              span.appendChild(button);
              span.appendChild(h1);
              ul.appendChild(span);
              div.appendChild(ul);
              button.onclick = like_comment;
              texterea.value = "";
            };
            fetch(`http://127.0.0.1:8000/comments/${id}`)
              .then((response) => response.json())
              .then((comments) => {
                if (comments.message) {
                  const h1 = document.createElement("h1");
                  h1.innerHTML = `${comments.message}`;
                  div.appendChild(h1);
                } else {
                  const ul = document.createElement("ul");
                  ul.id = "comment_ul";
                  comments.forEach((comment) => {
                    const id = parseInt(comment.id);
                    const li = document.createElement("li");
                    li.innerHTML = `${comment.username} said:<br>${comment.text}`;
                    li.className = "overflow";
                    ul.appendChild(li);
                    const button = document.createElement("button");
                    const span = document.createElement("span");
                    span.className = "flex";
                    const h1 = document.createElement("h1");
                    h1.innerHTML = comment.likes;
                    button.dataset.id = id;
                    button.classList =
                      "btn btn-sm btn-outline-primary follow_button";
                    fetch(`http://127.0.0.1:8000/liked_comment/${id}`)
                      .then((response) => response.json())
                      .then((bool) => {
                        console.log(bool);
                        if (bool.response) {
                          button.innerHTML = "dislike";
                        } else {
                          button.innerHTML = "like";
                        }
                      });
                    span.appendChild(button);
                    span.appendChild(h1);
                    ul.appendChild(span);
                    div.appendChild(ul);
                    button.onclick = like_comment;
                  });
                }
              });
            dive.appendChild(div);
          }
        };
      });
    });
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
function follow() {
  const id = parseInt(this.dataset.id);
  const followres = document.querySelector("#followres_numbre");
  let number = parseInt(followres.innerHTML.match(/\d+/)[0], 10);
  if (this.innerHTML.replace(/\n/g, "").replace(/\s/g, "") === "follow") {
    this.innerHTML = "unfollow";
    number = number + 1;
    fetch(`http://127.0.0.1:8000/follow/${id}`);
  } else {
    this.innerHTML = "follow";
    number = number - 1;
    fetch(`http://127.0.0.1:8000/unfollow/${id}`);
  }
  followres.innerHTML = number;
}

function show_follow() {
  const father_dive = document.querySelector(".user_page");
  father_dive.classList.add("display_none");
  father_dive.classList.remove("user_page");
  fetch(`http://127.0.0.1:8000/${this.dataset.follow}/${this.dataset.username}`)
    .then((response) => response.json())
    .then((data) => {
      //div for evrything
      const div = document.createElement("div");
      div.id = "follow_div";

      // back button
      const button = document.createElement("button");
      button.id = "back_button";
      button.classList = "btn btn-sm btn-outline-primary";
      button.innerHTML = "go back to the page";
      button.onclick = () => {
        div.remove();
        father_dive.classList.remove("display_none");
        father_dive.classList.add("user_page");
      };

      // follow list
      const ul = document.createElement("ul");
      ul.id = "follow_list";

      //list ellemnt
      data.forEach((user) => {
        username = user.username;
        const li = document.createElement("li");
        li.className = "follow_li";

        //li link's
        const a = document.createElement("a");
        a.id = "follow_a";
        a.innerHTML = `${username}`;
        a.href = `http://127.0.0.1:8000/users/${username}`;

        //AppendChildren
        li.appendChild(a);
        ul.appendChild(li);
      });

      //AppendChildren
      div.appendChild(button);
      div.appendChild(ul);
      document.querySelector(".body").appendChild(div);
    });
}

function like() {
  text = this.innerHTML;
  const div = this.parentElement;
  likes = div.querySelector("#like_count");
  id = parseInt(this.dataset.id);
  post_id = parseInt(this.dataset.post_id);
  fetch(`http://127.0.0.1:8000/${text}/${id}/${post_id}`);
  if (text === "like") {
    this.innerHTML = "dislike";
    likes.innerHTML = parseInt(likes.innerHTML) + 1;
  } else {
    this.innerHTML = "like";
    likes.innerHTML = parseInt(likes.innerHTML) - 1;
  }
}

function search() {
  const form = document.querySelector("#search_form");
  const input = document.querySelector("#input_user");
  const submit = document.querySelector("#submit_user");
  input.onkeyup = () => {
    if (input.value.length > 0) {
      submit.disabled = false;
    } else {
      submit.disabled = true;
    }
  };
  form.onsubmit = (event) => {
    event.preventDefault();
    if (document.querySelector(".search_div")) {
      document.querySelector(".search_div").remove();
    }
    const csrftoken = getCookie("csrftoken");
    fetch("http://127.0.0.1:8000/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({
        user: input.value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        document.querySelector("#page").style.display = "none";
        const dive = document.querySelector(".body");
        const div = document.createElement("div");
        div.className = "search_div";
        dive.appendChild(div);
        const ul = document.createElement("ul");
        ul.className = "search_ul";
        div.appendChild(ul);
        if (data.message) {
          const li = document.createElement("li");
          li.innerHTML = `${data.message}`;
          ul.appendChild(li);
        } else {
          data.forEach((user) => {
            console.log(user);
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = `http://127.0.0.1:8000/users/${user.user}`;
            a.innerHTML = `${user.user}`;
            li.appendChild(a);

            ul.appendChild(li);
          });
        }
      });
    document.querySelector("#input_user").value = "";
  };
}

function like_comment() {
  text = this.innerHTML;
  id = parseInt(this.dataset.id);
  const span = this.parentElement;
  const h1 = span.querySelector("h1");
  count = parseInt(h1.innerHTML);
  fetch(`http://127.0.0.1:8000/${text}_comment/${id}`)
    .then((response) => response.json())
    .then((bool) => {
      console.log(bool);
    });
  if (text === "like") {
    this.innerHTML = "dislike";
    count = count + 1;
  } else {
    this.innerHTML = "like";
    count = count - 1;
  }
  span.querySelector("h1").innerHTML = count;
}
let last_post_id = null;
function load_page() {
  let url = "get_posts";
  if (last_post_id) {
    url += `?last_post_id=${last_post_id}`;
  }
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
}

