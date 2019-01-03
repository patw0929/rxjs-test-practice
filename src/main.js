import { Observable } from 'rxjs/Observable';
import { fromEvent } from 'rxjs/add/observable/fromEvent';
import { fromPromise } from 'rxjs/add/observable/fromPromise';
import { switchMap } from 'rxjs/add/operator/switchMap';
import { debounceTime } from 'rxjs/add/operator/debounceTime';
import { pluck } from 'rxjs/add/operator/pluck';
import { map } from 'rxjs/add/operator/map';
import { filter } from 'rxjs/add/operator/filter';

const fetchAPI = url => {
  return fetch(url)
    .then(response => {
      if (response.status !== 200) {
        throw new Error('Invalid status');
      }

      return response.json();
    })
    .then(json => {
      return {
        total_count: json.total_count,
        items: json.items.map(item => {
          return {
            name: item.name,
            full_name: item.full_name,
          };
        }),
      };
    });
};

const searchRepo$ = key$ => {
  return key$.debounceTime(150)
    .pluck('target', 'value')
    .map(text => text.trim())
    .filter(query => query.length !== 0)
    .switchMap(query => {
      const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc`;

      return Observable.fromPromise(fetchAPI(url));
    });
};

const createKeyup$ = () => Observable.fromEvent(
  document.querySelector('#search-input'),
  'keyup'
);

searchRepo$(createKeyup$()).subscribe(value => {
  return document.querySelector('#results').innerHTML = value.items.map(
    repo => `<li class="list-group-item">${repo.full_name}</li>`
  ).join('');
});
