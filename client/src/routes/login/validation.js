import { writable } from 'svelte/store'
import {buildValidator} from "./validate.js";

// @ts-ignore
export function createFieldValidator(requiredValidator, emailValidator) {
  const { subscribe, set } = writable({ dirty: false, valid: false, message: null })
  const validator = buildValidator([requiredValidator(), emailValidator()])

  // @ts-ignore
  function action (node, binding) {
    // @ts-ignore
    function validate (value, dirty) {
      const result = validator(value, dirty)
      // @ts-ignore
      set(result)
    }

    validate(binding, false)

    return {
      // @ts-ignore
      update (value) {
        validate(value, true)
      }
    }
  }

  return [ { subscribe }, action ]
}