var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { parentPort } from 'node:worker_threads';
/**
 * Worker thread for processing tasks in the WorkerPool
 * This file runs in a separate worker thread context
 */
parentPort.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { taskId, data } = message;
        // Process the task based on data type
        const result = yield processTask(data);
        parentPort.postMessage({
            taskId,
            result,
            success: true
        });
    }
    catch (error) {
        parentPort.postMessage({
            taskId: message.taskId,
            error: error.message || String(error),
            success: false
        });
    }
}));
/**
 * Process a task based on its data type
 */
function processTask(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Handle different types of work based on data
        if (typeof data === 'string') {
            return `Processed: ${data}`;
        }
        else if (Array.isArray(data)) {
            return data.map((item) => `Processed: ${item}`);
        }
        else if (typeof data === 'object' && data !== null) {
            return Object.assign(Object.assign({}, data), { processed: true, timestamp: Date.now() });
        }
        else {
            return `Processed: ${String(data)}`;
        }
    });
}
