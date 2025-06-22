# MMM-Handball

<p style="text-align: center">
    <a href="https://choosealicense.com/licenses/mit"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

This module is an extention for the [MagicMirror](https://github.com/MichMich/MagicMirror).

The module is based on the work of [tschumel](https://github.com/tschumel) and [MMM-handball-netz](https://github.com/tschumel/MMM-handball-netz) and got extended by some ideas of the module of [fewieden](https://github.com/fewieden) and [MMM-NHL](https://github.com/fewieden/MMM-NHL).

### To-Do's
https://github.com/fewieden/MMM-NFL


## Installation

Open a terminal session, navigate to your MagicMirror's `modules` folder and execute `git clone https://github.com/jupadin/MMM-Handball.git`, such that a new folder called MMM-NBA will be created.

Activate the module by adding it to the `config.js` file of the MagicMirror as shown below.

The table below lists all possible configuration options.

````javascript
cd modules
git clone https://github.com/jupadin/MMM-Handball.git
cd MMM-Handball
npm install
````

## Using the module
````javascript
    modules: [
        {
            module: "MMM-Handball",
            header: "MMM-Handball",
            position: "top_left",
        }
    ]
````

## Configuration options
WIP