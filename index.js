// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, doc, addDoc, setDoc, getDocs, updateDoc, arrayRemove } from "firebase/firestore";
import { html, render } from "lit-html";

const firebaseConfig = {
  apiKey: "AIzaSyB5UX2SHZ4Mzc1XvF5UgDvTGd4WLwBOsQc",
  authDomain: "job-search-website-vz.firebaseapp.com",
  databaseURL: "https://job-search-website-vz-default-rtdb.firebaseio.com",
  projectId: "job-search-website-vz",
  storageBucket: "job-search-website-vz.appspot.com",
  messagingSenderId: "885937389036",
  appId: "1:885937389036:web:4321a4b35e152aab6554c9",
  measurementId: "G-4NSDHCC0QM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const userCollection = collection(db, "user");

let currentUser = "";
let currentJobs = [];
let currentUserId = "";

function displaySingleJob(jobs) {

    return html`
        ${jobs.map((job, index) => {
            return html`
            <div class="job">
                <div class="job-data">${job.title}</div>
                <div class="job-data">${job.companyName}</div>
                <div class="job-data"><a target="_blank" href="${job.jdLink}">${job.companyName + " job description link"}</a></div>
                <div class="job-data">${job.status}</div>
                <div class="job-data delete-btn" id="${index}">Delete</div>
            </div>`;
        })}
    `;
}

document.getElementById("login-btn").addEventListener("click", async () => {
    const curJobList = document.querySelector(".job-list");
    let usernameInput = document.getElementById("username").value;
    try {
        const findUserQuery = query(userCollection, where("username", "==", usernameInput));
        const userQueryResult = await getDocs(findUserQuery);
        if (userQueryResult.docs.length === 0) {
            await addDoc(userCollection, {
                username: usernameInput,
                jobs: [],
            }).then((newDoc) => { currentUserId = newDoc.id });
            currentUser = usernameInput;
            currentJobs = [];
        } else {
            currentUser = userQueryResult.docs[0].data()["username"];
            currentJobs = userQueryResult.docs[0].data()["jobs"];
            currentUserId = userQueryResult.docs[0].id;
        }
        document.getElementById("loggedin-username").textContent = "Welcome! " + currentUser;
        render(displaySingleJob(currentJobs), document.querySelector(".job-list"));
    } catch (e) {
        console.log("error on login/sign up:", e);
    }
})

document.getElementById("add-job-btn").addEventListener("click", async () => {
    const curJob = {
        title: document.getElementById("job-title").value,
        companyName: document.getElementById("company-name").value,
        jdLink: document.getElementById("jd-link").value,
        status: document.getElementById("status").value,
    };
    currentJobs.push(curJob);
    try {
        await updateDoc(doc(db, "user", currentUserId), {
            jobs: currentJobs
        });
        render(displaySingleJob(currentJobs), document.querySelector(".job-list"));
    } catch (e) {
        console.log("failed to add the job:", e);
    }
})

document.querySelector(".job-list").addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        let curJobId = e.target.id;
        currentJobs.splice(curJobId, 1);
        try {
            await updateDoc(doc(db, "user", currentUserId), {
                jobs: currentJobs
            });
            render(displaySingleJob(currentJobs), document.querySelector(".job-list"));
        } catch (e) {
            console.log("failed to delete the job:", e);
        }
    }
})

// document.getElementById("extension-add-job").addEventListener("click", async () => {
//     ext_company_list = localStorage.getItem("company_list");
//     ext_username = localStorage.getItem("username");
//     if (ext_company_list & ext_username & ext_company_list.length > 0) {
//         try {
//             const findUserQuery = query(userCollection, where("username", "==", ext_username));
//             const userQueryResult = await getDocs(findUserQuery);
//             if (userQueryResult.docs.length > 0) {
//                 let ext_userid = userQueryResult.docs[0].id;
//                 let ext_user_jobs = userQueryResult.docs[0].data()["jobs"];
//                 for (let i = 0; i < ext_company_list.length; i++) {
//                     ext_user_jobs.push(ext_company_list[i]);
//                 }
//                 await updateDoc(doc(db, "user", ext_userid), {
//                     jobs: ext_user_jobs
//                 });
//                 if (ext_username === currentUser) {
//                     currentJobs = ext_user_jobs;
//                     render(displaySingleJob(currentJobs), document.querySelector(".job-list"));
//                 }
//             }
//         } catch (e) {
//             console.log("failed to add job from extension:", e);
//         }
//     }
// })