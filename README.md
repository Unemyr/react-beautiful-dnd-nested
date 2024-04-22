## Overview, motivation and references

- This is a Jun'2023 fork of the popular react-beautiful-dnd library (https://github.com/atlassian/react-beautiful-dnd)
- Motivation - This fork has minor modifications to allow multiple nested lists (in different vertical and horizontal orientation) to get improved user experience and switch more smoothly and correctly between different nested lists while dragging objects
- It was inspired by the Dec'2018 patch of the library by welldan97 (https://github.com/welldan97/react-beautiful-dnd-nested), that is no longer directly applicable on recent codebase. Thanks welldan97, saved some time looking for the right place to modify the code!


## Behavior and limitations

The priority decision of which list to drop the dragged object to is based on an assumption that the list of droppable lists have been loaded in a nested order (which is the case in our tests so far, at least). There could be very specific conditions where this may not be the behaviour that you are looking for


## Get started

Compile a local library binary using 'yarn run build'


## Demo example

You can see the nested lists support in action on [Sprucely | Data Insights and Interactive Dashboards Service] (https://www.sprucely.io/) in the Dashboard Editor view (Note: You will need an account in order to access this part of the service, but its totally free and an e-mail address is the only detail asked for).

If you are not ready to setup an account, you can also refer to a screenshot of nested horizontal and vertical containers stacking widgets here [How Does Sprucely.io Work and Get Started] (https://www.sprucely.io/product/), although it does not allow you to interact with or test the behaviour of react-beautiful-dnd-nested directly.
