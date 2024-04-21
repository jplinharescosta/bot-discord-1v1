class QueueManager {
  constructor() {
    this.queues = {};
  }

  // Function to check if a user is already in any of the queues
  isUserInAnyQueue(userName) {
    return Object.values(this.queues).some((queue) => queue.includes(userName));
  }

  getUserQueue(userName) {
    for (const [queueName, queue] of Object.entries(this.queues)) {
      if (queue.includes(userName)) {
        return queueName;
      }
    }
    return null; // User not found in any queue
  }

  isUserInQueue(userName, queueName) {
    if (this.queues[queueName]) {
      return this.queues[queueName].includes(userName);
    } else {
      //console.log(`Queue ${queueName} does not exist`);
      return false;
    }
  }

  deleteQueue(queueName) {
    if (this.queues[queueName]) {
      delete this.queues[queueName];
      //console.log(`Queue ${queueName} has been deleted.`);
    } else {
      //console.log(`Queue ${queueName} does not exist`);
    }
  }

  // Function to add a user to a queue or create a new queue if necessary
  addUserToQueue(userName, queueName) {
    if (!this.isUserInQueue(userName, queueName)) {
      if (!this.queues[queueName]) {
        this.queues[queueName] = [];
      }
      this.queues[queueName].push(userName);
      //console.log(`User ${userName} has been added to queue ${queueName}`);
    } else {
      //console.log(`User ${userName} is already in a queue.`);
    }
  }

  // Function to remove a user from a queue
  removeUserFromQueue(userName, queueName) {
    if (this.queues[queueName]) {
      const index = this.queues[queueName].indexOf(userName);
      if (index !== -1) {
        this.queues[queueName].splice(index, 1);
        // console.log(
        //   `User ${userName} has been removed from queue ${queueName}`
        // );
      } else {
        //console.log(`User ${userName} is not in queue ${queueName}`);
      }
    } else {
      //console.log(`Queue ${queueName} does not exist`);
    }
  }

  countUsersInQueue(queueName) {
    if (this.queues[queueName]) {
      return this.queues[queueName].length;
    } else {
      //console.log(`Queue ${queueName} does not exist`);
      return 0;
    }
  }

  countTotalUsers() {
    let totalUsers = 0;
    Object.values(this.queues).forEach((queue) => {
      totalUsers += queue.length;
    });
    return totalUsers;
  }

  // Function to display the current state of all queues
  displayQueues() {
    console.log("Current state of queues:");
    Object.entries(this.queues).forEach(([queueName, queue]) => {
      console.log(`Queue ${queueName}: ${queue.join(", ")}`);
    });
  }
}

module.exports = QueueManager;
