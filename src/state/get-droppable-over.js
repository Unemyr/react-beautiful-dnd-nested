// @flow
import { type Position, type Rect } from 'css-box-model';
import type {
  DroppableDimension,
  DroppableDimensionMap,
  DroppableId,
  DraggableDimension,
  Axis,
} from '../types';
import { toDroppableList } from './dimension-structures';
import isPositionInFrame from './visibility/is-position-in-frame';
import { distance, patch } from './position';
import isWithin from './is-within';

// https://stackoverflow.com/questions/306316/determine-if-two-rectangles-overlap-each-other
// https://silentmatt.com/rectangle-intersection/
function getHasOverlap(first: Rect, second: Rect): boolean {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  );
}

type Args = {|
  pageBorderBox: Rect,
  draggable: DraggableDimension,
  droppables: DroppableDimensionMap,
|};

type WithDistance = {|
  distance: number,
  id: DroppableId,
|};

type GetInnerMostNestedOrderArgs = {|
  candidates: DroppableDimension[],
|};

function getInnerMostNestedOrder({
  candidates,
}: GetInnerMostNestedOrderArgs): ?DroppableId {
  // Iterate candidates and find the one with the innermost dimensions
  // Limitation - this does not support nested frames with negative margins - but that should be very rare
  let selectIndex = 0
  for (let i = 1; i < candidates.length; i++) {
    let boxSelected  = candidates[selectIndex].client.contentBox
    let boxCandidate = candidates[i].client.contentBox

    if ((boxCandidate.top    >= boxSelected.top   ) &&
        (boxCandidate.bottom <= boxSelected.bottom) &&
        (boxCandidate.left   >= boxSelected.left  ) &&
        (boxCandidate.right  <= boxSelected.right )) {
      selectIndex = i
    }
  }

  // Return candidate with innermost dimensions
  return (candidates[selectIndex] && candidates[selectIndex].descriptor) ? candidates[selectIndex].descriptor.id : null;
}

export default function getDroppableOver({
  pageBorderBox,
  draggable,
  droppables,
}: Args): ?DroppableId {
  // We know at this point that some overlap has to exist
  const candidates: DroppableDimension[] = toDroppableList(droppables).filter(
    (item: DroppableDimension): boolean => {
      // Cannot be a candidate when disabled
      if (!item.isEnabled) {
        return false;
      }

      // Cannot be a candidate when there is no visible area
      const active: ?Rect = item.subject.active;
      if (!active) {
        return false;
      }

      // Cannot be a candidate when dragging item is not over the droppable at all
      if (!getHasOverlap(pageBorderBox, active)) {
        return false;
      }

      // 1. Candidate if the center position is over a droppable
      if (isPositionInFrame(active)(pageBorderBox.center)) {
        return true;
      }

      // 2. Candidate if an edge is over the cross axis half way point
      // 3. Candidate if dragging item is totally over droppable on cross axis

      const axis: Axis = item.axis;
      const childCenter: number = active.center[axis.crossAxisLine];
      const crossAxisStart: number = pageBorderBox[axis.crossAxisStart];
      const crossAxisEnd: number = pageBorderBox[axis.crossAxisEnd];

      const isContained = isWithin(
        active[axis.crossAxisStart],
        active[axis.crossAxisEnd],
      );

      const isStartContained: boolean = isContained(crossAxisStart);
      const isEndContained: boolean = isContained(crossAxisEnd);

      // Dragging item is totally covering the active area
      if (!isStartContained && !isEndContained) {
        return true;
      }

      /**
       * edges must go beyond the center line in order to avoid
       * cases were both conditions are satisfied.
       */
      if (isStartContained) {
        return crossAxisStart < childCenter;
      }

      return crossAxisEnd > childCenter;
    },
  );

  if (!candidates.length) {
    return null;
  }

  // Only one candidate - use that!
  if (candidates.length === 1) {
    return candidates[0].descriptor.id;
  }

  // Multiple options returned
  // Should only occur with really large items or nested list
  // Hack - Going to prioritize nested sub-lists first instead of the closest one
  return getInnerMostNestedOrder({
    candidates,
  });
}
