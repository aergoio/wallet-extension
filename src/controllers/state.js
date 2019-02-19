import {EventEmitter} from 'events';

const IDLE_TIMEOUT = 60 * 1000;

class State extends EventEmitter {
    constructor() {
        super();
        this._idleTimeout = null;
        this.set('initial');
    }

    /**
     * App states: initial -> active -> inactive -> idle
     * Opening UI switches state to active. Closing UI switches state to inactive.
     * After being inactive for a certain amount of time, switch to idle.
     * @param {string} nextState 
     */
    set(nextState) {
        if (nextState != 'inactive') {
            if (this._idleTimeout) {
                clearTimeout(this._idleTimeout);
            }
        }
        if (this.state != nextState && nextState == 'inactive') {
            if (this._idleTimeout) {
                clearTimeout(this._idleTimeout);
            }
            this._idleTimeout = setTimeout(() => {
                this.set('idle');
            }, IDLE_TIMEOUT);
        }
        if (this.state != nextState) {
            console.log(`[state] ${this.state} -> ${nextState}`);
        }
        this.state = nextState;
        this.emit('change', nextState);
        this.emit(nextState);
    }
}

export default State;