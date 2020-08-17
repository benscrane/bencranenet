---
title: A Probability Function for JS Dice
date: 2019-10-06 00:00:00
tags:
    - Probability
    - JavaScript
excerpt: Using math to win at gambling
---
<!--more-->
# Staying Alive in Dice with JS
***Goal***: *To create a JavaScript function that calculates the probability that at least one player will end up with a dice roll lower than or equal to yours.* 

## Dice Scenario
You roll a 54 on your first roll.  Other players have gone before you and you can roll at most 2 times.  Currently, your roll of 54 is the lowest and there are 2 players to roll after you.

*What is the probability, given your roll, the number of rolls allowed to each player, and the number of players left, that you won't lose this round?*

*In other words, what is the probability that at the end of the round, one of the other two players will be stuck with a score less than or equal to 54?*

### Assumptions
* If a player rolls higher than your score of 54 on their first try, they won't roll again.
* If a player rolls lower than or equal to your score of 54 on their first try, they will roll again.

## Probability Basics
Since we're dealing with dice rolls, all the events being considered here are independent.  A dice roll is unaffected by that player's previous rolls or the rolls of any other players.

### Terms
**Probability Intersection**: The probability that events A and B both occur is the probability of the intersection of of A and B.

![intersection](https://latex.codecogs.com/svg.latex?P%28A%5Ccap%20B%29%20%3D%20P%28A%29%5Ctimes%20P%28B%29)

**Probability Union**: The probability that events A or B occcur is the probability union of A and B.

![union](https://latex.codecogs.com/svg.latex?P%28A%5Ccup%20B%29%20%3D%20P%28A%29&plus;%20P%28B%29%20-%20P%28A%5Ccap%20B%29)

## Simplifed Cases
We'll consider simplified cases first and build to a generalized solution.

### One player left, 2 rolls allowed
When we consider whether a single player will end up with a roll less than or equal to ours in 2 rolls, we need the probability that they will roll <= 54 twice.  This means the intersection of events A and B where both A and B are the event of rolling a 54 or less.

Expressed in an equation this is:

![equation](https://latex.codecogs.com/svg.latex?P%2854%5Ccap%2054%29%20%3D%20P%2854%29%5Ctimes%20P%2854%29%20%3D%20P%2854%29%5E%7B2%7D)

The probability of any roll being less than or equal to 54 is 50%.  

![equation](https://latex.codecogs.com/svg.latex?P%2854%5Ccap%2054%29%20%3D%200.5%20%5Ctimes%200.5%20%3D%200.5%5E%7B2%7D%20%3D%200.25)

So with one player behind us and 2 rolls allowed, the probability that our roll of 54 doesn't lose is only 25%.
#### Generalized
From here we can generalize the function to find the probablity of any one player ending up with a roll equal to or less than ours.

* **roll**: Our roll
* **n**: Number of rolls allowed
* **P(roll)**: Probability of one dice roll being equal to or less than roll. *e.g. P(54) = 0.5*
* **P(stayAlive)**: The probability that we're not the lowest roll at the end of the round.

![equation](https://latex.codecogs.com/svg.latex?P%28stayAlive%29%20%3D%20P%28roll%29%5E%7Bn%7D)

### Two players left, 1 roll allowed
If there are two players left, we only need one of them to end up with a roll less than or equal to our roll of 54 in order to stay alive.  For this we need the union of events A and B where both events represent one player rolling <= 54.

Here's that expressed as an equation:

![equation](https://latex.codecogs.com/svg.latex?P%2854%20%5Ccup%2054%29%20%3D%20P%2854%29%20&plus;%20P%2854%29%20-%20P%2854%20%5Ccap%2054%29)

P(54) is still equal to 0.5 and the intersection of two P(54) events is 0.25, as shown above.

![equation](https://latex.codecogs.com/svg.latex?P%2854%20%5Ccup%2054%29%20%3D%200.5%20&plus;%200.5%20-%200.25%20%3D%200.75)

With two players behind us and only one roll allowed, the probability that our roll of 54 doesn't lose is 75%.

#### Generalized
This equation was a bit harder to generalize mathematically.  What's important to note is that the union of 2 events is the union of those probabilities.  If we take that union of 2 events as it's own event, then the union of 3 events is the union of the event and the previous union of just 2 of the events. 

In equation form:

![equation](https://latex.codecogs.com/svg.latex?P%28A%20%5Ccup%20A%20%5Ccup%20A%29%20%3D%20P%28A%20%5Ccup%20%28P%28A%20%5Ccup%20A%29%29%29)

Expanding this out as the number of events grows gets a bit tedious but we can use the programming concept known as recursion to simplify this in code.

## Bringing it together
In our first simplified case, we found a formula for the probability of 1 player being stuck with a roll equal to or less than our own, given n number of rolls.  

In our second case, we found the formula for determining if at least one of p players behind us would be stuck with a roll <= our roll but we limited them to only one roll.

We can plug our generalized equation for one player, multiple rolls into our equation for multiple players to get our full solution.

For two players left and two rolls allowed, here's that equation:

![equation](https://latex.codecogs.com/svg.latex?P%28stayAlive%29%20%3D%20P%28P%2854%5Ccap%2054%29%20%5Ccup%20P%2854%5Ccap%2054%29%29)

![equation](https://latex.codecogs.com/svg.latex?P%28stayAlive%29%20%3D%20P%28P%2854%29%5E%7B2%7D%20%5Ccup%20P%2854%29%5E%7B2%7D%29)

![equation](https://latex.codecogs.com/svg.latex?P%28stayAlive%29%20%3D%20P%280.5%5E%7B2%7D%20%5Ccup%200.5%5E%7B2%7D%29%20%3D%20P%280.25%20%5Ccup%200.25%29)

![equation](https://latex.codecogs.com/svg.latex?P%28stayAlive%29%20%3D%200.25%20&plus;%200.25%20-%200.25%5E%7B2%7D%20%3D%200.4375)

If we roll a 54 with 2 players left behind us and 2 rolls allowed, we have a 43.75% chance of not being eliminated and at least making it to a roll off.

## From math to code
I mentioned that we can use recursion to make our task easier in code.  This is because the probability that at least 1 out of n players rolls less than or equal to our roll is just the union of the probability of one player rolling <= our roll and the probability of the probability of n-1 players rolling <= our roll.

![equation](https://latex.codecogs.com/svg.latex?f%28n%29%20%3D%20f%281%29%20%5Ccup%20f%28n-1%29)

Here we have a function that calls it self n-1 times.  If we wrote that out it would get messy quickly but it's easy for a computer to keep track of it.  

Here's this function in JavaScript.
```js
function probabilityUnion(prob, numRolls, numPlayers) {
    if (numPlayers === 1) {
        return Math.pow(prob, numRolls);
    } else {
        return Math.pow(prob, numRolls) + probabilityUnion(prob, numRolls, numPlayers - 1) -
            (Math.pow(prob, numRolls) * probabilityUnion(prob, numRolls, numPlayers -1));
    }
}
```

* **prob**: The probability of the event in question (*e.g. a roll being less than or equal to ours*)
* **numRolls**: Number of rolls allowed
* **numPlayers**: Number of players left to go after us.

This function will call itself, decreasing numPlayers by 1 in each call, until it reaches it's base case where numPlayers = 1.

### Testing
We can test with the 3 scenarios we worked out manually to verify the function works as we expect.

#### 1 player, 2 rolls
Given our roll of 54, which has a probability of 0.5, we found the probability of staying alive was 0.25.
```js
probabilityUnion(0.5, 2, 1);
>>> 0.25
```

#### 2 players, 1 roll
Here the probability of a roll of 54 staying alive was 0.75.
```js
probabilityUnion(0.5, 1, 2);
>>> 0.75
```
#### 2 players, 2 rolls
With 2 players and 2 rolls, the chance that a roll of 54 didn't lose was 0.4375.
```js
probabilityUnion(0.5, 2, 2);
>>> 0.4375
```

## Summary
We've created a simple JavaScript function that can calculate the probability that a certain roll won't lose given any number of players left to go and any number of roll allowed.

This function will be the basis for a larger function that determines whether or not the computer player should roll again.  Since this math is too complex for a person to do on the fly in a real game of dice, the computer player should make statistically better decisions.