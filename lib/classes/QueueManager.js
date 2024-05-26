class QueueManager {
  constructor() {
    this.queues = {};
  }

  /**
   * Checks if a user is in any queue.
   * @param {string} userName - The name of the user to check.
   * @returns {boolean} True if the user is in any queue, otherwise false.
   */
  isUserInAnyQueue(userName) {
    return Object.values(this.queues).some((queue) => queue.includes(userName));
  }

  /**
   * Gets the name of the queue the user is in.
   * @param {string} userName - The name of the user.
   * @returns {string|null} Thes name of the queue if the user i found, otherwise null.
   */
  getUserQueue(userName) {
    for (const [queueName, queue] of Object.entries(this.queues)) {
      if (queue.includes(userName)) {
        return queueName;
      }
    }
    return null; // User not found in any queue
  }

  /**
   * Checks if a user is in a specific queue.
   * @param {string} userName - The name of the user.
   * @param {string} queueName - The name of the queue to check.
   * @returns {boolean} True if the user is in the queue, otherwise false.
   */
  isUserInQueue(userName, queueName) {
    const queue = this.queues[queueName];
    return queue ? queue.includes(userName) : false;
  }

  /**
   * Deletes a queue if it exists.
   * @param {string} queueName - The name of the queue to delete.
   * @throws {Error} If the queue does not exist.
   */
  deleteQueue(queueName) {
    if (!this.queues[queueName]) {
      throw new Error(`Queue ${queueName} does not exist`);
    }
    delete this.queues[queueName];
  }

  /**
   * Adds a user to a queue if they are not already in it.
   * @param {string} userName - The name sof the user to add.
   * @param {string} queueName - The name of the queue to add the user to.
   */
  addUserToQueue(userName, queueName) {
    if (!this.isUserInQueue(userName, queueName)) {
      if (!this.queues[queueName]) {
        this.queues[queueName] = [];
      }
      this.queues[queueName].push(userName);
    }
  }

  /**
   * Removes a user from a queue if they are in it.
   * @param {string} userName - The name of the user to remove.
   * @param {string} queueName - The name of the queue to remove the user from.
   * @throws {Error} If the queue or user does not exist.
   */
  removeUserFromQueue(userName, queueName) {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} does not exist`);
    }
    const index = queue.indexOf(userName);
    if (index === -1) {
      throw new Error(`User ${userName} is not in queue ${queueName}`);
    }
    queue.splice(index, 1);
  }

  /**
   * Counts the number of users in a specific queue.
   * @param {string} queueName - The name of the queue.
   * @returns {number} The number of users in the queue.
   */
  countUsersInQueue(queueName) {
    const queue = this.queues[queueName];
    return queue ? queue.length : 0;
  }

  /**
   * Counts the total number of users across all queues.
   * @returns {number} The total number of users.
   */
  countTotalUsers() {
    return Object.values(this.queues).reduce(
      (total, queue) => total + queue.length,
      0
    );
  }

  /**
   * Displays the current state of all queues.
   */
  displayQueues() {
    console.log("Current state of queues:");
    Object.entries(this.queues).forEach(([queueName, queue]) => {
      console.log(`Queue ${queueName}: ${queue.join(", ")}`);
    });
  }
}

module.exports = QueueManager;
