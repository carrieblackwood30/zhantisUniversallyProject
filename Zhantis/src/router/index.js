import { createRouter, createWebHistory } from "vue-router";
import RegisterView from "../views/RegisterView.vue";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/Home.vue";   // новый главный экран
import CartView from "../views/CartView.vue";
import AdminView from "../views/AdminView.vue";

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/register", name: "register", component: RegisterView },
  { path: "/login", name: "login", component: LoginView },
  { path: "/cart", name: "cart", component: CartView },
  { path: "/admin", name: "admin", component: AdminView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;