<script>
  import "../app.pcss";
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Avatar, Dropdown, DropdownItem, DropdownHeader, DropdownDivider } from 'flowbite-svelte';
  import {navigating, page} from "$app/stores";
  import { goto } from "$app/navigation";
  import '@jaspero/web-components/dist/alert.wc';
  import {user} from "$lib/utils/state.ts";
  import {browser} from "$app/environment";
  import {onMount} from "svelte";

  let loading = false;

  const filterRoutes = [
    '/login',
    '/reset-password'
  ];

  const UNAUTHENTICATED_ROUTES = [
    '/login',
    '/reset-password'
  ];

  $: hideNav = filterRoutes.includes($page.url.pathname);
  $: if (!$navigating && browser) checkRoute();

  function signOut () {
    user.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    goto('/login');
  }

  async function isAuthenticated() {
    const token = localStorage.getItem('token');

    if (!token) {
        return false;
    }

    let url = 'http://localhost:3000/api/users/verify';

    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    let result = await response.json();

    if (result.error) {
      signOut();
      return;
    }

    return true;
  }

  async function checkRoute() {
    loading = true;
    const route = $page?.route?.id;

    if (!route) {
      loading = false;
      return;
    }

    const isUnauthenticatedRoute = UNAUTHENTICATED_ROUTES.includes(route);
    const isAuth = await isAuthenticated();


    if (isUnauthenticatedRoute) {
      if (isAuth) {
        goto('/dashboard');
      }
      loading = false;
      return;
    }

    if (!isAuth) {
      signOut();
    }

    loading = false;
  }


  onMount(() => {
    checkRoute();
  })

  onMount(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user.set(JSON.parse(storedUser));
    } else {
      goto('/login');
    }
  });

</script>

{#if !hideNav}
    <Navbar class="shadow-lg">
        <NavBrand>
            <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Cron Server</span>
        </NavBrand>
        <div class="flex items-center md:order-2">
            <Avatar id="avatar-menu"></Avatar>
            <NavHamburger class1="w-full md:flex md:w-auto md:order-1"></NavHamburger>
        </div>
        <Dropdown placement="bottom" triggeredby="#avatar-menu">
            <DropdownHeader>
                <span class="block truncate text-sm font-medium">{$user?.email}</span>
            </DropdownHeader>
            <DropdownItem>Dashboard</DropdownItem>
            <DropdownItem>Settings</DropdownItem>
            <DropdownItem>Jobs</DropdownItem>
            <DropdownDivider></DropdownDivider>
            <DropdownItem on:click={() => signOut()}>Sign out</DropdownItem>
        </Dropdown>
        <NavUl>
            <NavLi active="{true}">Users</NavLi>
            <NavLi active="{true}">Accounts</NavLi>
            <NavLi active="{true}">Responses</NavLi>
        </NavUl>
    </Navbar>
{/if}

<slot></slot>