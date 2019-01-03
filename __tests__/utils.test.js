import {
  searchRepo$,
  fetchRepoList$,
} from '../src/utils';
import { Observable, TestScheduler } from 'rxjs';
import { of } from 'rxjs/add/observable/of';

let scheduler;

const deepEquals = (actual, expected) =>
  expect(actual).toEqual(expected);

describe('searchRepo$', () => {
  beforeEach(() => {
    scheduler = new TestScheduler(deepEquals);
  });

  it('should match expected result', () => {
    const keyup =    '^-a-b---c-----|';
                     // ^-- debounce 20 frames
                     //   ^-- debounce, so output "b" after 20 frames
                     //       ^-- debounce, so output "c" after 20 frames
    const expected = '------x---y---|';
    const mockAPI = {
      r: 'react',
      rx: 'rx',
      rxj: 'rxjs',
    };

    const fetch$ = query => {
      return Observable.of(mockAPI[query]);
    };

    const keyup$ = scheduler.createHotObservable(keyup, {
      a: { target: { value: 'r' } },
      b: { target: { value: 'rx' } },
      c: { target: { value: 'rxj' } },
    });

    const result$ = searchRepo$(keyup$, fetch$, 20, scheduler);

    scheduler.expectObservable(result$).toBe(expected, {
      x: mockAPI['rx'],
      y: mockAPI['rxj'],
    });
  });

  it('should match expected result with delay response', () => {
    const keyup    = '^-a--b------|';
    const expected = '---------x--|';
    const mockAPI = {
      r: 'react',
      rx: 'rx',
    };
    const fetch$ = query => {
      return Observable.of(mockAPI(query)).delay(40, scheduler);
    };
    const keyup$ = scheduler.createHotObservable(keyup, {
      a: { target: { value: 'r' } },
      b: { target: { value: 'rx' } },
    });
    const result$ = searchRepo$(keyup$, fetch$, 0, scheduler);

    scheduler.expectObservable(result$).toBe(expected, {
      x: mockAPI['rx'],
    });
  });
});
