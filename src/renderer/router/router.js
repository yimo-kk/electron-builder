
import Main from '@/components/main/main.vue'
export default  [
    {
      path: '/',
      name: 'Home',
      component: require('@/components/main/main').default
    },
    // {
    //   path: '/Main',
    //   name: 'Main',
    //   component: Main,
    //   children:[
    //     {
    //       path: '/Main/currentChat',
    //       name: 'CurrentChat',
    //       component:  require('@/view/currentChat').default
    //     },
    //     {
    //       path: '/Main/awaitChat',
    //       name: 'AwaitChat',
    //       component:  require('@/view/awaitChat').default
    //     },
    //     {
    //       path: '/Main/groupChat',
    //       name: 'GroupChat',
    //       component:  require('@/view/groupChat').default
    //     }
        
    //   ]
    // },
 
    {
      path: '/login',
      name: 'Login',
      component: require('@/view/login').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]

