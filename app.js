// Making function like this allows for encapsulation (keeping data private)
// BUDGET CONTROLLER  - keeps track of all budget related stuff
var budgetController = (function () {
  // Object thats stores description, id, value
  var Expense = function (
    id,
    description,
    value
  ) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (
    totalIncome
  ) {
    if (totalIncome > 0) {
      this.percentage = Math.round(
        (this.value / totalIncome) * 100
      );
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (
    id,
    description,
    value
  ) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(
      function (cur) {
        sum = sum + cur.value;
      }
    );
    data.totals[type] = sum;

    /*
        0
        [200, 400, 100]
        sum = 0 + 200
        sum = 200 + 400
        sum = 600 + 100
        */
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },

    totals: {
      exp: 0,
      inc: 0,
    },

    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      if (
        data.allItems[type].length > 0
      ) {
        // ID = Last ID + 1; this creates new ID
        ID =
          data.allItems[type][
            data.allItems[type].length -
              1
          ].id + 1;
      } else {
        ID = 0;
      }

      // Creates new item based on 'inc' or 'exp'
      if (type === "exp") {
        newItem = new Expense(
          ID,
          des,
          val
        );
      } else if (type === "inc") {
        newItem = new Income(
          ID,
          des,
          val
        );
      }

      /* "type" being in the array will determine if its a inc or an expense after that it'll 
            add it to the end of the array */
      data.allItems[type].push(newItem);

      // return new item
      return newItem;
    },

    calculateBudget: function () {
      // Calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // Calculate the budget: income - expenses and stores in an object that is updated.
      data.budget =
        data.totals.inc -
        data.totals.exp;

      // Calculate the percentage of income we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round(
          (data.totals.exp /
            data.totals.inc) *
            100
        );
      } else {
        data.percentage = -1;
      }
    },

    deleteItem: function (type, id) {
      var ids, index;

      // Loop over all elements in income or expenses array
      // Returns a brand new array with all the ids as their values.
      var ids = data.allItems[type].map(
        function (current) {
          return current.id;
        }
      );

      // Returns the array index of the id that is being searched.
      index = ids.indexOf(id);

      // Removes exactly 1 element from the array.
      if (index !== -1) {
        // splice removes elements from array
        data.allItems[type].splice(
          index,
          1
        );
      }
    },

    calculatePercentages: function () {
      // Calculate the expenses:
      /*
                a = 20
                b = 10
                c = 40
                Total = 100
                a = 20/100
                b = 10/100
                c = 40/100
            */

      data.allItems.exp.forEach(
        function (cur) {
          cur.calcPercentage(
            data.totals.inc
          );
        }
      );
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(
        function (cur) {
          return cur.getPercentage();
        }
      );
      return allPerc;
    },

    // Updates the values from the data object.
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

// UI CONTROLLER
var UIController = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription:
      ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer:
      ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel:
      ".budget__income--value",
    expensesLabel:
      ".budget__expenses--value",
    percentageLabel:
      ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel:
      ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (
    num,
    type
  ) {
    var numSplit, int, dec;
    /*
        Display Rules:
            +/- is placed before a number 
            exactly two decimal points
            comma separating the thousands and above
        */

    num = Math.abs(num);
    num = num.toFixed(2); // allows it to have only 2 decimal points

    numSplit = num.split(".");

    int = numSplit[0]; // Gets values before the decimal point

    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (
      (type === "exp"
        ? (sign = "-")
        : (sign = "+")) +
      " " +
      int +
      "." +
      dec
    );
  };

  var nodeListForEach = function (
    list,
    callback
  ) {
    for (
      var i = 0;
      i < list.length;
      i++
    ) {
      callback(list[i], i);
    }
  };

  return {
    // This whole return block returns all the methods/functions that you can use when you call on UIControllers instance.
    getInput: function () {
      // A function that returns these 3 objects. Return is needed because we need these values to be returned to the controller variable so we can use them again.
      return {
        type: document.querySelector(
          DOMstrings.inputType
        ).value,
        description: document.querySelector(
          DOMstrings.inputDescription
        ).value,
        value: parseFloat(
          document.querySelector(
            DOMstrings.inputValue
          ).value
        ),
      };
    },

    // This adds the new value, type, id into the UI under the income or expense titles.
    addListItem: function (obj, type) {
      var html, newHTML, element;

      // Create HTML string with placeholder text
      if (type === "inc") {
        element =
          DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value"> %value%</div>  <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      } else if (type === "exp") {
        element =
          DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value"> %value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }

      // Replace the placeholder text with actual data
      newHTML = html.replace(
        "%id%",
        obj.id
      );
      newHTML = newHTML.replace(
        "%description%",
        obj.description
      );
      newHTML = newHTML.replace(
        "%value%",
        formatNumber(
          obj.value,
          obj.type
        )
      );

      // Insert HTML into DOM
      document
        .querySelector(element)
        .insertAdjacentHTML(
          "beforeend",
          newHTML
        );
    },

    deleteItemList: function (
      selectorID
    ) {
      var el = document.getElementById(
        selectorID
      );
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArr;

      // Gets both description and value input section in html and stores it in fields variable.
      fields = document.querySelectorAll(
        DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );

      // tricks slice method into thinking its an array
      fieldsArr = Array.prototype.slice.call(
        fields
      );

      fieldsArr.forEach(function (
        current,
        index,
        array
      ) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      var type;
      obj.budget > 0
        ? (type = "inc")
        : (type = "exp");

      document.querySelector(
        DOMstrings.budgetLabel
      ).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(
        DOMstrings.incomeLabel
      ).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(
        obj.totalExp,
        "exp"
      );

      if (obj.percentage > 0) {
        document.querySelector(
          DOMstrings.percentageLabel
        ).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(
          DOMstrings.percentageLabel
        ).textContent = "---";
      }
    },

    displayPercentages: function (
      percentages
    ) {
      var fields = document.querySelectorAll(
        DOMstrings.expensesPercLabel
      );

      nodeListForEach(fields, function (
        current,
        index
      ) {
        // Display on webpage
        if (percentages[index] > 0) {
          current.textContent =
            percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function () {
      var year, now, month, months;

      // Returns date object.
      now = new Date();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = now.getMonth();
      year = now.getFullYear();

      document.querySelector(
        DOMstrings.dateLabel
      ).textContent =
        months[month] + " " + year;
    },

    changeType: function () {
      var fields;

      // Returns a node.
      fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function (
        cur
      ) {
        cur.classList.toggle(
          "red-focus"
        );
      });

      document
        .querySelector(
          DOMstrings.inputBtn
        )
        .classList.toggle("red");
    },

    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

// GLOBAL APP CONTROLLER - this allows you to speak to other functions in the code that are private.
// WE PUT IT IN A VARIABLE SO IT CAN BE USED OUTSIDE OF THIS SCOPE.
var controller = (function (
  budgetCtrl,
  UICtrl
) {
  var setupEventListeners = function () {
    // Gets html strings in UIController
    var DOM = UIController.getDOMstrings();

    // ' .' is used to select class is CSS
    document
      .querySelector(DOM.inputBtn)
      .addEventListener(
        "click",
        ctrlAddItem
      ); // Calls ctrlAddItem whenever user clicks on button.

    document.addEventListener(
      "keypress",
      function (
        event // Creates a function using the event "ENTER" and checks to see if it was pressed.
      ) {
        if (
          event.keyCode === 13 ||
          event.which === 13
        ) {
          ctrlAddItem();
        }
      }
    );

    document
      .querySelector(DOM.container)
      .addEventListener(
        "click",
        ctrlDeleteItem
      );
    document
      .querySelector(DOM.inputType)
      .addEventListener(
        "change",
        UICtrl.changeType
      );
  };

  var updateBudget = function () {
    // Calculate the budget
    budgetCtrl.calculateBudget();

    // Return the budget
    var budget = budgetCtrl.getBudget();

    // Display the budget to the UI
    UICtrl.displayBudget(budget);
  };

  updatePercentages = function () {
    // Calculate the percentages
    budgetCtrl.calculatePercentages();

    // Read percentages from budget controller
    var percentages = budgetCtrl.getPercentages();

    // Update the UI
    UICtrl.displayPercentages(
      percentages
    );
  };

  var ctrlAddItem = function () {
    var input, newItem;

    // Get input data
    input = UICtrl.getInput();

    if (
      input.description !== "" &&
      !isNaN(input.value) &&
      input.value > 0
    ) {
      // Add item to the budget controller
      newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );

      // Add the item to the UI
      UICtrl.addListItem(
        newItem,
        input.type
      );

      // Clear fields
      UICtrl.clearFields();

      // Calc and update budget
      updateBudget();

      // Calc and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (
    event
  ) {
    // put the event element as an argument so you can click on the x button

    var itemID, splitID, type, ID;
    itemID =
      event.target.parentNode.parentNode
        .parentNode.parentNode.id;

    if (itemID) {
      // inc-1
      // This returns an array of characters based of what user splits it by.
      // based off "inc-1" the array will be splitID[0] = inc and splitID[1] = 1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // delete the item from data structure
      budgetCtrl.deleteItem(type, ID);

      // delete the item from the UI
      UICtrl.deleteItemList(itemID);

      // update and show in UI
      updateBudget();

      // Calc and update percentages
      updatePercentages();
    }
  };
  return {
    // must do it like this so you can have use it as a property outside of the scope.
    init: function () {
      UICtrl.displayMonth();

      // Display the budget to the UI
      UICtrl.displayBudget({
        //doing this passes an object with properties: budget, totalInc, totalExp, Percentage. Instead of passing all four values.
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });

      setupEventListeners();
    },
  };
})(budgetController, UIController); // Passes in these objects parameter to allow you to use their data when you declare it in var controller.
// Passing in budgetController will make budgetController = budgetCtrl
// its like creating a function and passing in a value.

// Initializes code.
controller.init();
