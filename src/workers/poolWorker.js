const { parentPort } = require('worker_threads');

/**
 * Worker thread for processing tasks in the WorkerPool
 * This file runs in a separate worker thread context
 */

parentPort.on('message', async (message) => {
  try {
    const { taskId, data } = message;

    // Process the task based on data type
    const result = await processTask(data);

    parentPort.postMessage({
      taskId,
      result,
      success: true
    });
  } catch (error) {
    parentPort.postMessage({
      taskId: message.taskId,
      error: error.message || String(error),
      success: false
    });
  }
});

/**
 * Process a task based on its data type
 */
async function processTask(data) {
  // Handle different types of work based on data
  if (typeof data === 'string') {
    return `Processed: ${data}`;
  } else if (Array.isArray(data)) {
    return data.map((item) => `Processed: ${item}`);
  } else if (typeof data === 'object' && data !== null) {
    return { ...data, processed: true, timestamp: Date.now() };
  } else {
    return `Processed: ${String(data)}`;
  }
}
