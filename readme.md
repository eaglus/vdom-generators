List of browsers on which the application should work: https://caniuse.com/#search=generators
It works on FF60, latest Chrome, Edge 16, and later.

How to start the application: from the root directory run **yarn start**, and then go to http://localhost:5000/
The database with the loaded data lies in indexedDB under the name meteodb.
There are two tables. In each table data are grouped by months.

Jest framework is used for test.
Tests can be run by installing the jest and packages for it via **yarn install**, and then running the jest from the root of the application - **yarn jest**

Comments on the application:

I wanted to show the advantages of the declarative approach in constructing the interface (as in the react.js), and i made a mini react-like engine.
Also I made a small redux-like state management library.

Everything begins in the module **main.js** - there is a store with the producers that handle the actions sent by the interface.
The makeStore function takes the initial state of the application (without the chart data - they are in indexDB), the combined reducer, and the function for updating the interface (onUpdate).
This function builds the root node (virtual dom), passing it data from the store, and calls the updater function, which "unfolds" the components in the layout, and updates the corresponding dom in the browser.

The root component can be found in the components / app directory.
A component can be either a function that builds vdom from properties, or a class. A class can have its own state, which can be initialized in the constructor, and can be changed by calling the setState method.
setState works in the same way as in a test, and updates its own component only, and its child components, and layout.

In the App component, you can also see the bemClassProps function - it makes long class names in the spirit of the bem method ("block" is a component, an "element" is a vdom node in the component, and a "modifier" is a string indicating the state of the component) .
Classes in css have to be written manually, and they turn out to be long. This is not a big problem, but in real code you can use preprocessors, css-modules, css-in-js, or something else.

The layout is built using the function h (hyperscript), which takes the tag as the first argument, if it is a simple node, or a class, or a component function, and other arguments pass the properties and child nodes.

The event handler in the component is specified through properties with the prefix "on" (see the ActiveFilterSelector component).
The handler can call the setState method changing internal state of the component.
It can return a simple "action" object, which will be executed on the reducers, after which the entire interface will be rebuilt (with updating / adding / removing only the changed nodes).
If the event handler does not return anything, then no action will be performed.
If it returns a function as an action, it will be launched as thunk (https://github.com/gaearon/redux-thunk). In this way, the handler can return an action that works with an external environment, loads something, and issues simple actions to the reducers.

Thus, the component code is almost "clean", action handlers do not touch anything in browser environment, and it is convenient to test them, simply by building the layout by properties, and checking the action objects that the handlers return.
This picture is spoiled by the setState method, which can be called from the handlers, and it could also be made a special action. I will try to implement setState as action in future.

YearSelector calendar component uses setState method - there the first year displayed in the calendar is stored and the indication of whether to show the calendar - it is displayed by clicking on the current year.
In the YearSelector component, you can also see the life-cycle methods of the component-also as in the response: componentDidUpdate, componentWillUnmount, and the constructor. You can close the calendar by clicking the "Escape" button, selecting the year, or by clicking outside.
The calendar has two YearSelector - for start and end of range, they are in the parent component of the Filter.
They call the loadForFilterFrom and loadForFilterTo actions, respectively, these actions are handled by the reducer / filters.js, where the selected range is validated, and then the selected range is downloaded (see the actions / index.js module).
Thanks to the vdom-engine, this component turned out to be simple. Independently updating its contents, child components, and event handlers would be pretty hard .

Another approach adopted from react.js is the high-order component (HOC).
This is provideSize HOC in the module lib / utils / component.js. It monitors window size changes, recalculates the size of the "wrapped" component, and updates the properties of that component.
This way, we calculate dimensions for canvas of Chart component from the chart.js module (ChartComponent takes sizes from provideSize, and the "top" component is exported with the name Chart).
Also, the component engine supports shouldComponentUpdate method, which prevents update the component, and its entire hierarchy, if some important properties have not changed (as react.js does).
This method is implemented in the chart component (chart.js).
The chart is updated to call the componentDidUpdate method, which is called after the engine has updated the component's layout (if shouldComponentUpdate returned true). 
For chart, it updates only the canvas element, draws the data series/axis on it.

About chart:

* the range of the chart along the X axis can be changed by selecting in the range selection above the chart, then the required data piece is loaded.
* downloaded data can be scaled along the X axis, rotating the mouse wheel, and the point above which the cursor is positioned is not shifted - so it is more convenient to scale the desired area.
* You can also drag scaled chart to the right or to the left. The scale along the Y axis when scaling and shifting along the X axis also varies according to the selected range.
* the chart is recalculated when the window is resized

* because it is not clear to which time zone data in the test files (temperature.json and precipitation.json belong), I believe that the time is there in UTC.

The data in the chart is loaded from the store, in the store they come from indexedDB, and there from the network (this is done by the loader from the actions / load / index.js module).
If a large range is selected, there are several data points per point in the graph, and it is unclear how to show ...
Averaging is not good, because the spread is too big ... I draw a 'candle' at this point, with the top being the maximum of the indicator at this point in the chart, and the bottom is the minimum.
So, candles are obtained no more than the points on the graph, it is drawn quickly, and with increasing scale the shape of the chart does not change much.

Also, i want to comment on the approach with which the component engine is made - the main algorithm is made on generators (lib / vdom / diff.js).
The generator itself does not change anything in the browser - it produces the commands that the interpreter executes (there are two interpreters - documentInterpreter.js and textInterpreter.js).
The first executes all the commands issued by the generator, and updates the dom, manages the events (they all are on the top node of the mount, one handler for each type of event).
The second executes only the commands that create the node, and produces text that can be given from the server, for example. There is a test for it (textInterpeter.test.js).
Also, this separation allows (in future) the interpreter to make animations more smooth, delaing execution of the current command until current animation ends.
We can also make another interpreter - for tests, which will build a tree in json format - and on it you can test "snapshots" of components, as it is done in enzyme library.

Also, generator/command approach was done in loading data (actions / load / loadGenerator.js), and there the load algorithm also gives commands, and it has tests, and there are tests for the module executing the commands (loadHandlers. js).
It is also convenient to cancel the process through the generator - in my function, which executes the generator's commands, a "cancel token" is sent, which can stop the execution of the generator's commands. 

Also on the simulation of slow internet you can see that while the download of a new range is in progress, the chart shows the old one and it can be moved and scaled until new data is loaded.
