import { merge } from 'rxjs/observable/merge'
import { Subject } from 'rxjs/Subject'

function forceArray (arr) {
  if (!Array.isArray(arr)) return [arr]
  return arr
}

export default function ({ event$, commandHandler, store, api }) {
  const store$ = new Subject()

  const boundedMiddleware = store => next => action => {
    event$.next(action)
    const nextState = next(action)
    store$.next(nextState)
    return nextState
  }

  const reduxStore = store(boundedMiddleware)
  const command$ = new Subject()

  merge(...forceArray(commandHandler(command$, store$)))
    .subscribe(e => {
      try {
        reduxStore.dispatch(e)
      } catch (e) {
        console.error(e)
      }
    })

  return api({
    store: reduxStore,
    sendCommand: e => command$.next(e)
  })
}
