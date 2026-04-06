// Core type definitions for the agentic engine
export var AgentState;
(function (AgentState) {
    AgentState["IDLE"] = "IDLE";
    AgentState["PERCEIVING"] = "PERCEIVING";
    AgentState["REASONING"] = "REASONING";
    AgentState["PLANNING"] = "PLANNING";
    AgentState["EXECUTING"] = "EXECUTING";
    AgentState["LEARNING"] = "LEARNING";
    AgentState["ERROR"] = "ERROR";
    AgentState["HALTED"] = "HALTED";
})(AgentState || (AgentState = {}));
export var Priority;
(function (Priority) {
    Priority[Priority["CRITICAL"] = 0] = "CRITICAL";
    Priority[Priority["HIGH"] = 1] = "HIGH";
    Priority[Priority["MEDIUM"] = 2] = "MEDIUM";
    Priority[Priority["LOW"] = 3] = "LOW";
})(Priority || (Priority = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["RUNNING"] = "RUNNING";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["FAILED"] = "FAILED";
    TaskStatus["CANCELLED"] = "CANCELLED";
    TaskStatus["RETRYING"] = "RETRYING";
})(TaskStatus || (TaskStatus = {}));
//# sourceMappingURL=index.js.map