import axios from "axios";


export async function logoutHandler() {
    const asUrl = process.env.REACT_APP_AUTHORIZATION_SERVER_URL;

    axios({
        method : "get",
        url : `${asUrl}/logout`,
        withCredentials : true
    }).then((res)=>{
        sessionStorage.clear();
        document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href="/";
    }).catch((err)=>{
        console.log(err);
    })
}