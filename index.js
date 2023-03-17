// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, doc, addDoc, setDoc, getDocs, updateDoc } from "firebase/firestore";
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
        ${jobs.map((job) => {
            return html`
            <div class="job">
                <div class="job-data">${job.title}</div>
                <div class="job-data">${job.companyName}</div>
                <div class="job-data"><a target="_blank" href="${job.jdLink}">${job.companyName + " job description link"}</a></div>
                <div class="job-data">${job.status}</div>
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