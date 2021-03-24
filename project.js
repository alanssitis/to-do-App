// Load the database first
const firebaseConfig = {
  apiKey: "AIzaSyD5u3act0hLLdbY1Er9_nTbehpgUHB7ves",
  authDomain: "code-saturdays.firebaseapp.com",
  projectId: "code-saturdays",
  storageBucket: "code-saturdays.appspot.com",
  messagingSenderId: "147010523602",
  appId: "1:147010523602:web:09cff22ed71bd0ec80b80b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let database = firebase.database();

// A basic Vue component
Vue.component('add-tasks', {
  props: ['click'],
  template:`
    <div>
      <input v-model="newTask">
      <button class="button-add" v-on:click="add_new_task">Add task</button>
    </div>
  `,
  data: function() {
    return {
      newTask: ""
    };
  },
  methods: {
    add_new_task: function() {
      if (this.newTask != "") {
        this.$emit('task-added', this.newTask);
        this.newTask = "";
      }
    }
  }
});

Vue.component('show-task', {
  props: ['task'],
  template:`
    <div>
      <button 
        class="button-finish" 
        v-on:click="finish_curr_task"
        >Finish</button>
      <input v-model="task.task" :disabled="editing == 1">
      <button 
        class="button-edit" 
        v-on:click="edit_curr_task"
        >{{button_label}}</button>
      <button 
        class="button-delete"
        v-on:click="delete_curr_task"
        >Delete</button>
      <br>
    </div>
  `,
  data: function() {
    return {
      editing: 1,
      button_label: "Edit"
    };
  },
  methods: {
    finish_curr_task: function() {
      this.$emit('task-finish', this.task.id);
    },
    edit_curr_task: function () {
      if (this.editing == 1) {
        this.editing = 0;
        this.button_label = "Save";
      } else {
        this.editing = 1;
        this.button_label = "Edit";
        this.$emit('task-edited',this.task.id, this.task.task);
      }
    },
    delete_curr_task: function () {
      this.$emit('task-delete', this.task.id);
    }
  }
})

Vue.component('show-finished', {
  props: ['task'],
  template:`
    <div>
      <button 
        class="button-unfinish"
        v-on:click="unfinish_curr_task"
        >Unfinish</button>
      <input v-model="task.task" :disabled="editing == 1">
      <button 
        class="button-edit" 
        v-on:click="edit_curr_task"
        >{{button_label}}</button>
      <button 
      class="button-delete" 
      v-on:click="delete_curr_task"
      >Delete</button>
      <br>
    </div>
  `,
  data: function() {
    return {
      editing: 1,
      button_label: "Edit"
    };
  },
  methods: {
    unfinish_curr_task: function() {
      this.$emit('task-unfinish', this.task.id);
    },
    edit_curr_task: function () {
      if (this.editing == 1) {
        this.editing = 0;
        this.button_label = "Save";
      } else {
        this.editing = 1;
        this.button_label = "Edit";
        this.$emit('task-edited',this.task.id, this.task.task);
      }
    },
    delete_curr_task: function () {
      this.$emit('task-delete', this.task.id);
    }
  }
})

// The Vue instance
const app = new Vue({
  el: '#app',
  data: {
    newTask: "",
    tasks: [],
    taskID: 0,
  },
  methods: {
    add_task: function(newTask) {
      this.tasks = this.tasks || [];
      this.tasks.push({id: this.taskID, status: 'active', task: newTask});
      database.ref('/tasks/' + this.taskID).set({
        task: newTask,
        status: 'active',
        id: this.taskID
      });

      this.taskID++;
      database.ref('/').update({counter: this.taskID});
    },
    finish_task: function(fTask) {
      index = this.tasks.findIndex(item => item.id == fTask);
      this.tasks[index].status = "finished";
      database.ref('/tasks/' + fTask).update({status: "finished"});
    },
    unfinish_task: function(fTask) {
      index = this.tasks.findIndex(item => item.id == fTask);
      this.tasks[index].status = "active";
      database.ref('/tasks/' + fTask).update({status: "active"});
    },
    edit_task: function(eTask, taskName) {
      database.ref('/tasks/' + eTask).update({task: taskName});
    },
    delete_task: function(dTask) {
      this.tasks = this.tasks.filter(x => {
        return x.id != dTask;
      })
      database.ref('/tasks/' + dTask).remove();
    },
  },
  created: function() {
    database.ref('/tasks/').once('value').then((snap) => {
      for (let key in snap.val()) {
        this.tasks = this.tasks || [];
        this.tasks.push(snap.val()[key])
      }
    }),
    database.ref('/counter').once('value').then((snap) => {
      this.taskID = snap.val();
    })
  },
});
