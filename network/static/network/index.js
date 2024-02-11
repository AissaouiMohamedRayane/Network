document.addEventListener('DOMContentLoaded', ()=>{
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
                csrfmiddlewaretoken="KM1am1qAL2zqfUIVEog8OFO5ldt0RCTiTWQgE2as90cVOMAVrHjScPKRae1itBtT"
                form.onsubmit=(event)=>{
                    event.preventDefault();
                    fetch(`add_comment/1`,{
                        method:'POST',
                        headers: {
                            'X-CSRFToken': csrfmiddlewaretoken
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
                fetch(`comments/${id}`)
                .then(response => response.json())
                .then(comments=>{
                    console.log(comments)
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