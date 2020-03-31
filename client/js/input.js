class Keys {
  constructor() {
    this.down = {};
    this.held = {};
    this.released = {};

    window.addEventListener('keydown', ({key}) => {
      const keyName = key.toLowerCase();
  
      if(!this.held[keyName]) {
        this.down[keyName] = true;
      }

      this.held[keyName] = true;
    });
  
    window.addEventListener('keyup', ({key}) => {
      const keyName = key.toLowerCase();
      
      this.down[keyName] = false;
      this.held[keyName] = false;
      this.released[keyName] = true;
    });
  }

  reset() {
    this.down = {};
    this.released = {};
  }
}

const keys = new Keys();