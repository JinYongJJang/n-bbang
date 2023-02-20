import {createWebHistory, createRouter} from 'vue-router'

import Main from '../views/Main.vue'
import Auth from '../views/Auth.vue'
import Gps from '../views/Gps.vue'
import SignUp from '../views/SignUp.vue'
import Evaluation from '../views/Evaluation.vue'
import listRoom from '../views/listRoom'
import createRoom from '../views/createRoom'
import listDetail from '../views/listDetail'


const routes = [
  {
    path: '/',
    name: 'Main',
    component: Main,
    props: true
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
    props: true
  },
  {
    path: '/gps',
    name: 'Gps',
    component: Gps,
    props: true
  },
  {
    path: '/signUp',
    name: 'SignUp',
    component: SignUp,
    props: true
  },
  {
    path: '/evaluation',
    name: 'Evaluation',
    component: Evaluation,
    props: true
  },
  {
    path: '/list-room',
    name: 'listRoom',
    component: listRoom,
    props: true
  },
  {
    path: '/create-room',
    name: 'createRoom',
    component: createRoom,
    props: true
  },
  {
    path: '/list-detail/:id',
    name: 'listDetail',
    component: listDetail,
    props: true
  }
]

const router = new createRouter({
  history: createWebHistory(),
  routes,
})
// console.log(router);

export default router;