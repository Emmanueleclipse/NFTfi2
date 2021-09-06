import { createWebHistory, createRouter } from "vue-router";

//main view
import MainLayout from "@/layouts/MainLayout";

const routes = [
    // dashboard
    {
        path: "/",
        redirect: "/dashboard",
        component: MainLayout,
        // dashboard auth guard
        beforeEnter(to, from, next) {
            if (!isLogin()) {
                next("/login");
            } else {
                next();
            }
        },
        children: [{
                path: "/dashboard",
                name: "dashboard",
                component: () =>
                    import ( /* webpackChunkName: "dashboard" */ "@/views/Dashboard.vue"),
                meta: { sideBarKey: "Dashboard" }
            },
            {
                path: "/account",
                name: "account",
                component: () =>
                    import ( /* webpackChunkName: "account" */ "@/views/Account.vue"),
                meta: { sideBarKey: "Account" }
            },
            {
                path: "/reclaim",
                name: "reclaim",
                component: () =>
                    import ( /* webpackChunkName: "reclaim" */ "@/views/Reclaim.vue"),
                meta: { sideBarKey: "reclaim" }
            },
            {
                path: "/stakes",
                name: "stakes",
                component: () =>
                    import ( /* webpackChunkName: "stakes" */ "@/views/Stakes.vue"),
                meta: { sideBarKey: "stakes" }
            },

            {
                path: "/contact-us",
                name: "contact",
                component: () =>
                    import ( /* webpackChunkName: "stakes" */ "@/views/ContactUs.vue"),
                meta: { sideBarKey: "contact" }
            }
        ]
    },
    // auth
    {
        path: "/login",
        name: "Login",
        component: () =>
            import ( /* webpackChunkName: "login" */ "@/views/auth/Login.vue")
    }
];

const isLogin = function() {
    // validate session
    if (localStorage.getItem("ual-session-authenticator")) {
        return true;
    } else {
        return false;
    }
};

// create router with web history
const router = createRouter({
    history: createWebHistory(),
    routes
});

// export the router
export default router;