<script>
  import "../app.pcss";
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Avatar, Dropdown, DropdownItem, DropdownHeader, DropdownDivider } from 'flowbite-svelte';
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import '@jaspero/web-components/dist/alert.wc';
  import {onMount} from "svelte";
  import {user} from "$lib/utils/state.ts";

  const filterRoutes = [
    '/login'
  ];

  $: hideNav = filterRoutes.includes($page.url.pathname);

  function signOut () {
    goto('/login');
  }
</script>

{#if !hideNav}
    <Navbar class="shadow-lg">
        <NavBrand href="/">
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
            <DropdownItem href="/dashboard">Dashboard</DropdownItem>
            <DropdownItem>Settings</DropdownItem>
            <DropdownItem href="/jobs">Jobs</DropdownItem>
            <DropdownDivider></DropdownDivider>
            <DropdownItem on:click={() => signOut()}>Sign out</DropdownItem>
        </Dropdown>
        <NavUl>
            <NavLi href="/" active="{true}">Home</NavLi>
            <NavLi href="/users">Users</NavLi>
            <NavLi href="/accounts">Accounts</NavLi>
            <NavLi href="/jobs">Jobs</NavLi>
            <NavLi href="/responses">Responses</NavLi>
        </NavUl>
    </Navbar>
{/if}

<slot></slot>