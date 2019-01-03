import { Observable } from 'rxjs/Observable';
import { searchRepo$, fetchRepoList$, createKeyup$ } from './utils';

searchRepo$(createKeyup$(), fetchRepoList$, 150).subscribe(value => {
  return document.querySelector('#results').innerHTML = value.items.map(
    repo => `<li class="list-group-item">${repo.full_name}</li>`
  ).join('');
});
