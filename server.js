const express = require('express');
const cors = require('cors');
const knex = require('knex');

const app = express()

app.use(express.json());
app.use(cors());

const today_task = 
    {
        taskProfile: [     
            {
                id: 1,
                type: "Task",
                title: "Workout",
                desc: "Push, Core & 3x Circuit"
            },
            {
                id: 2,
                type: "Task",
                title: "Cardio",
                desc: "Run, 1.5 km"
            },
            {
                id: 3,
                type: "Event",
                title: "Subhecha's Birthday",
                desc: "20 July, 2021, she turns 22!"
            }
    ]
}

const daily_task = 
    {
        taskProfile: [     
            {
                id: 1,
                type: "Task",
                title: "Eat Healthy",
                desc: "Focus on intermittent fasting"
            },
            {
                id: 2,
                type: "Task",
                title: "LeetCode",
                desc: "2x LeetCode Questions"
            },
            {
                id: 3,
                type: "Task",
                title: "Guitar",
                desc: "Spend an hour practicing the guitar."
            }
    ]
}

const notes = 
    {
        taskProfile: [     
            {
                id: 1,
                title: "Research",
                desc: "I could work with genetic algorithms for my paper."
            },
            {
                id: 2,
                title: "Explore GRE?",
                desc: "Maybe I should explore writing GRE for further studies."
            },
            {
                id: 3,
                title: "Productivity",
                desc: "I need to be way more productive."
            }
    ]
}

const Data = {
  "time" : 1550476186479,
  "blocks" : [
    {
      "type": "header",
      "data": {
         "text": "I visited my grandmother!",
         "level": 2
      }
   },
   {
      "type": "paragraph",
      "data": {
         "text": "I visited my grandmother today, not only was it extremely fun, I also learned a lot. I got to ride horses and explore grandma's farm. It was super interesting!"
      }
   },
   {
      "type": "header",
      "data": {
         "text": "The animals she had were:",
         "level": 3
      }
   },
   {
      "type": "list",
      "data": {
         "style": "unordered",
         "items": [
            "Dogs",
            "Cows, Bulls",
            "And Pigs!"
         ]
      }
   },
   {
      "type": "header",
      "data": {
         "text": "I also completed my first ever marathon.",
         "level": 3
      }
   },
   {
      "type": "paragraph",
      "data": {
         "text": "I am so glad I could complete this marathon in time. Not only am I looking forward to participating in more, I also want to improve my half marathon timings in the next few months. Let's see how it goes!"
      }
   }
  ],
  "version" : "2.8.1"
}




const overviewData = {
    "time" : 1550476186479,
    "blocks" : [
      {
        "type": "header",
        "data": {
           "text": "Editor",
           "level": 2
        }
     },
     {
        "type": "paragraph",
        "data": {
           "text": "Hey. Meet the new Editor. On this page you can see it in action — try to edit this text. Source code of the page contains the example of connection and configuration."
        }
     },
     {
        "type": "header",
        "data": {
           "text": "Key features",
           "level": 3
        }
     },
     {
        "type": "list",
        "data": {
           "style": "unordered",
           "items": [
              "It is a block-styled editor",
              "It returns clean data output in JSON",
              "Designed to be extendable and pluggable with a simple API"
           ]
        }
     },
     {
        "type": "header",
        "data": {
           "text": "What does it mean «block-styled editor»",
           "level": 3
        }
     },
     {
        "type": "paragraph",
        "data": {
           "text": "Workspace in classic editors is made of a single contenteditable element, used to create different HTML markups. Editor.js <mark class=\"cdx-marker\">workspace consists of separate Blocks: paragraphs, headings, images, lists, quotes, etc</mark>. Each of them is an independent contenteditable element (or more complex structure) provided by Plugin and united by Editor's Core."
        }
     }
    ],
    "version" : "2.8.1"
  }
  


app.post('/', (req, res) => {
    res.json(today_task.taskProfile);
})

app.post('/addToday', (req, res) => {
    const {taskType, taskTitle, taskDesc} = req.body;
    today_task.taskProfile.push(
        {
            id: 4,
            type: taskType,
            title: taskTitle,
            desc: taskDesc
        }
    )
    res.json(today_task.taskProfile);
})

app.post('/daily', (req, res) => {
    
    res.json(daily_task.taskProfile);
})

app.post('/dailyAdd', (req, res) => {
    const {taskType, taskTitle, taskDesc} = req.body;
    daily_task.taskProfile.push(
        {
            id: 4,
            type: taskType,
            title: taskTitle,
            desc: taskDesc
        }
    )
    res.json(daily_task.taskProfile);
})

app.post('/notes', (req, res) => {
    res.json(notes.taskProfile);
})

app.post('/notesAdd', (req, res) => {
    const {taskTitle, taskDesc} = req.body;
    notes.taskProfile.push(
        {
            id: 4,
            title: taskTitle,
            desc: taskDesc
        }
    )
    res.json(notes.taskProfile);
})

app.post('/editor', (req, res) => {
    res.json(Data);
})

app.post('/editorSave', (req, res) => {
    const saveData = req.body;
    res.json("Data recieved successfully");
})

app.post('/overview', (req, res) => {
    res.json(overviewData)
})

app.listen(3005, () => {
    console.log('The server is running on post 3005');
})