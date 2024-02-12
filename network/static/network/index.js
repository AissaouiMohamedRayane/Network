document.addEventListener('DOMContentLoaded', ()=>{
    const button=document.querySelector('#follow_button');
    if(button){
        button.onclick=follow;
    }
    const followed=document.querySelector("#follow");
    if (followed){
        const children=Array.from(followed.children);
        console.log(children);
        children.forEach(li=>{
            li.onclick=show_follow;
        });
    }
    document.querySelectorAll('.comment').forEach(comment => {
        comment.onclick=()=>{
            id=parseInt(comment.dataset.id)
            const dive=comment.parentElement;
            const existing_div=dive.querySelector('#comment_div');
            const form=dive.querySelector('#comment_form');
            if(existing_div){
                existing_div.remove();
                form.classList.add('display_none');

            }else{
                form.classList.remove('display_none');
                const div=document.createElement('div');
                div.id="comment_div";
                const h2=document.createElement('h2');
                h2.innerHTML="Comments:";
                h2.id="comment_h2"
                div.appendChild(h2);
                form.onsubmit=(event)=>{
                    event.preventDefault();
                    const csrftoken = getCookie('csrftoken');
                    fetch(`http://127.0.0.1:8000/add_comments/${id}`,{
                        method:'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrftoken
                        },
                        body:JSON.stringify({
                            text:dive.querySelector('#comment_texterea').value,
                        })
                    })
                    .then(response=>response.json())
                    .then(data=>{
                        if(data.message){
                            alert(data.message)
                        }                        
                    })
                }
                fetch(`http://127.0.0.1:8000/comments/${id}`)
                .then(response => response.json())
                .then(comments=>{
                    if(comments.message){
                        const h5=document.createElement('h5');
                        h5.innerHTML=`${comments.message}`;
                        div.appendChild(h5);
                    }else{
                        const ul=document.createElement('ul');
                        ul.id='comment_ul';
                        comments.forEach(comment=>{
                            const li=document.createElement('li');
                            li.innerHTML=`<div>${comment.username} said:</div><div>${comment.text}</div>`;
                            ul.appendChild(li);
                            div.appendChild(ul);
                        });                          
                    }
                })
                dive.appendChild(div);
            }
        }
    });
})

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
function follow(){
    const id= parseInt(this.dataset.id);
    const followres= document.querySelector("#followres_numbre");
    let number = parseInt(followres.innerHTML.match(/\d+/)[0], 10);
    if(this.innerHTML.replace(/\n/g, '').replace(/\s/g, '')==="follow"){
        this.innerHTML="unfollow";
        number=number+1;
        fetch(`http://127.0.0.1:8000/follow/${id}`)
    }else{
        this.innerHTML="follow";
        number=number-1;
        fetch(`http://127.0.0.1:8000/unfollow/${id}`)
    }
    followres.innerHTML=number
}

function show_follow(){
    const father_dive=document.querySelector('.user_page');
    father_dive.classList.add('display_none');
    father_dive.classList.remove('user_page');
    fetch(`http://127.0.0.1:8000/${this.dataset.follow}/${this.dataset.username}`)
    .then(response=>response.json())
    .then(data=>{
        //div for evrything
        const div=document.createElement('div');
        div.id='follow_div';

        // back button
        const button=document.createElement('button');
        button.id='back_button'
        button.classList="btn btn-sm btn-outline-primary";
        button.innerHTML='go back to the page';
        button.onclick=()=>{
            div.remove();
            father_dive.classList.remove('display_none');
            father_dive.classList.add('user_page');
        }

        // follow list
        const ul=document.createElement('ul');
        ul.id='follow_list';

        //list ellemnt
        data.forEach(user=>{
            username=user.username;
            const li=document.createElement('li');
            li.className='follow_li';

            //li link's
            const a=document.createElement('a');
            a.id='follow_a';
            a.innerHTML=`${username}`
            a.href=`http://127.0.0.1:8000/users/${username}`;

            //AppendChildren
            li.appendChild(a);
            ul.appendChild(li);
        })

        //AppendChildren
        div.appendChild(button);
        div.appendChild(ul);
        document.querySelector(".body").appendChild(div);
    })
}