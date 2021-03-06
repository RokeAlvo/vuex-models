/*
  vuex-model
  Simple getter/action/mutation generator and getter/setter mapper for vuex

  @author: ikenfin
*/

import Vue from 'vue';
import capitalize from 'capitalize';
import isPlainObject from 'is-plain-object';

import {
  toMutationName,
  normalizeMap,
  normalizeNamespace
} from './lib/utils';

/*
  action/mutation/getter prefix
  used to prevent collisions with user defined code
*/
const PREFIX = 'Vxm';

/*
  Generate getter/action/mutation's for vuex store
  storeAttr - is required state attribute name - this holds values
*/
const genVuexModels = (fields, storeAttr = null) => {
  const result = {
    getters: {},
    actions: {},
    mutations: {},
    state: {}
  }
  const setDefaultValue = isPlainObject(fields)

  if (storeAttr !== false) {
    if (!storeAttr) {
      storeAttr = PREFIX
    }
    result.state[storeAttr] = {}
  }

  normalizeMap(fields).reduce(function (prev, { key, val }) {
    if (setDefaultValue) {
      if (storeAttr) {
        result.state[storeAttr][key] = val
      }
      else {
        result.state[key] = val
      }
    }
    prev.getters[`${PREFIX}_${key}`] = function (state) {
      return storeAttr !== false ? state[storeAttr][key] : state[key]
    }
    prev.actions[`set${PREFIX}_${capitalize(key)}`] = function ({ commit }, data) {
      commit(toMutationName(`${PREFIX}_${key}`), data)
    }
    prev.mutations[toMutationName(`${PREFIX}_${key}`)] = function (state, value) {
      storeAttr !== false ? Vue.set(state[storeAttr], key, value) : Vue.set(state, key, value)
    }

    return prev
  }, result)

  return result
}

/*
  Create { actions, getters, mutations } object to be injected in components
*/
const mapVuexModels = (models, namespace = '') => {
  namespace = normalizeNamespace(namespace)
  models = normalizeMap(models)

  return models.reduce(function (prev, {key, val}) {
    prev[key] = {
      get () {
        return this.$store.getters[`${namespace}${PREFIX}_${val}`]
      },
      set (value) {
        this.$store.dispatch(`${namespace}set${PREFIX}_${capitalize(val)}`, value)
      }
    }

    return prev
  }, {});
}

export {
  genVuexModels,
  mapVuexModels
}