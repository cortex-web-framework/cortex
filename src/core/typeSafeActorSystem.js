/**
 * Type-Safe Actor System
 *
 * A complete refactoring of the actor system to support type-safe messaging
 * using discriminated unions and generics. This replaces the loose `any` types
 * with compile-time checked message passing.
 */
/**
 * Type-safe actor reference that can only send messages of type TMessage
 */
export class TypedActorRef {
    constructor(id, sendFn) {
        this.id = id;
        this.sendFn = sendFn;
    }
    tell(message) {
        this.sendFn(message);
    }
    send(message) {
        this.sendFn(message);
    }
}
/**
 * Base class for type-safe actors
 * TState: The state type of the actor
 * TMessage: The discriminated union of messages this actor can handle
 */
export class TypeSafeActor {
    constructor(id, initialState, system) {
        this.mailbox = [];
        this.isProcessing = false;
        this.restartCount = 0;
        this.id = id;
        this.state = initialState;
        this.system = system;
    }
    /**
     * Get current actor state
     */
    getState() {
        return this.state;
    }
    /**
     * Get actor ID
     */
    getId() {
        return this.id;
    }
    /**
     * Post a message to this actor
     * Messages are queued and processed sequentially
     */
    postMessage(message) {
        this.mailbox.push(message);
        this.processMailbox();
    }
    /**
     * Process all pending messages in the mailbox
     */
    processMailbox() {
        if (!this.isProcessing) {
            this.isProcessing = true;
            process.nextTick(() => {
                while (this.mailbox.length > 0) {
                    const message = this.mailbox.shift();
                    if (message) {
                        try {
                            this.receive(message);
                        }
                        catch (error) {
                            this.system.handleActorFailure(this, error);
                        }
                    }
                }
                this.isProcessing = false;
            });
        }
    }
    /**
     * Lifecycle hook: called before actor starts
     */
    preStart() { }
    /**
     * Lifecycle hook: called after actor stops
     */
    postStop() { }
    /**
     * Lifecycle hook: called before actor restarts
     */
    preRestart(_reason) { }
    /**
     * Lifecycle hook: called after actor restarts
     */
    postRestart(_reason) { }
}
/**
 * Type-safe actor system
 * Manages actor creation, message dispatch, and lifecycle
 */
export class TypeSafeActorSystem {
    constructor(_eventBus) {
        this.actors = new Map();
        // EventBus reserved for future integration
    }
    /**
     * Create a new type-safe actor
     */
    createActor(ActorClass, id, initialState) {
        if (this.actors.has(id)) {
            throw new Error(`Actor with id ${id} already exists`);
        }
        const actor = new ActorClass(id, initialState, this);
        this.actors.set(id, actor);
        // Store metadata for restart
        actor._ActorClass = ActorClass;
        actor._InitialState = initialState;
        actor.restartCount = 0;
        actor.preStart();
        return new TypedActorRef(id, (message) => {
            actor.postMessage(message);
        });
    }
    /**
     * Get an actor by ID (returns untyped reference)
     */
    getActor(id) {
        return this.actors.get(id);
    }
    /**
     * Stop an actor
     */
    stopActor(id) {
        const actor = this.actors.get(id);
        if (actor) {
            actor.postStop();
            this.actors.delete(id);
            console.log(`Actor '${id}' stopped`);
        }
        else {
            console.warn(`Attempted to stop non-existent actor '${id}'`);
        }
    }
    /**
     * Handle actor failure with supervision strategy
     */
    handleActorFailure(actor, error) {
        console.error(`Actor '${actor.getId()}' failed:`, error);
        actor.restartCount++;
        if (actor.restartCount > TypeSafeActorSystem.MAX_RESTARTS) {
            console.error(`Actor '${actor.getId()}' exceeded max restarts. Stopping actor.`);
            this.stopActor(actor.getId());
        }
        else {
            console.warn(`Restarting actor '${actor.getId()}' (restart count: ${actor.restartCount})`);
            actor.preRestart(error);
            const ActorClass = actor._ActorClass;
            const initialState = actor._InitialState;
            const actorId = actor.getId();
            this.stopActor(actorId);
            const newActor = new ActorClass(actorId, initialState, this);
            this.actors.set(actorId, newActor);
            newActor._ActorClass = ActorClass;
            newActor._InitialState = initialState;
            newActor.restartCount = actor.restartCount;
            newActor.postRestart(error);
        }
    }
    /**
     * Get all actors in the system
     */
    getAllActors() {
        return Array.from(this.actors.values());
    }
    /**
     * Get actor count
     */
    getActorCount() {
        return this.actors.size;
    }
    /**
     * Shut down the entire actor system
     */
    shutdown() {
        const actors = Array.from(this.actors.values());
        for (const actor of actors) {
            this.stopActor(actor.getId());
        }
        console.log('Actor system shut down');
    }
}
TypeSafeActorSystem.MAX_RESTARTS = 3;
/**
 * Helper function to create a typed actor system
 */
export function createTypeSafeActorSystem() {
    return new TypeSafeActorSystem();
}
//# sourceMappingURL=typeSafeActorSystem.js.map