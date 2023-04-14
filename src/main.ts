import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// // import { setupCounter } from './counter'
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `
// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

console.log("start");

// Connect it to the backend
const provider = new HocuspocusProvider({
    url: "ws://127.0.0.1:1234",
    name: "example-document",
});

// Define `tasks` as an Array
const tasks = provider.document.getArray("tasks");

// Listen for changes
tasks.observe((event, t) => {
    // console.log("tasks were modified", event, t);
    const data = event.target.toJSON();
    console.log("we have items", data.length);
});

let count = 0

setInterval(() => {
    // Add a new task
    tasks.push([`task number ${count}`]);
    count += 1
}, 5000)

// Add a new task
// tasks.push(["buy milk"]);
