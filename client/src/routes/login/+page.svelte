<script lang="ts">
  import { Button, Checkbox, Label, Input } from "flowbite-svelte";
  import { emailValidator, requiredValidator } from './validators.js'
  import { createFieldValidator } from './validation.js'
  import {writable} from "svelte/store";
  import {session} from './sessions.js';
  import { goto } from '$app/navigation';
  import { alertWrapper } from "$lib/utils/alert-wrapper";
  import {user} from "$lib/utils/state";

  const AUTH_SERVER_URL_LOGIN = '/api/users/login';
  const AUTH_SERVER_URL_SIGNUP = '/api/users/signup';


  const [validity, validate] = createFieldValidator(requiredValidator(), emailValidator());

  let email = '';
  let password = '';
  let formState = writable('login');
  let mode = 'login';
  let combined;
  let data;

  $: combined = {email: email, password: password};

  $: if(data) {
    $session.data = data;
  }

  async function authenticate() {
    let url = 'http://localhost:3000' + (mode === 'login' ? AUTH_SERVER_URL_LOGIN : AUTH_SERVER_URL_SIGNUP);

    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(combined)
    });

    let text = await response.json();
    let data = text;
    return text;
  }

  async function submitHandler(event) {
    event.preventDefault();

    await alertWrapper(
      authenticate(),
      'Login successful',
      (error) => console.log(error),
      () => console.log('Error'),
    ).then((result) => {
      if (result.email) {
        user.set({
            email: result.email,
            token: result.token
        })
      }
      if (result.token) {
        session.set(result.token);
        goto('/dashboard');
      }
      email = '';
      password = '';
    });
  }

  function formChange(src: string) {
    formState.set(src);
  }
</script>
<div class="flex justify-center items-center">
    <div class="login-form w-96 my-24 border-solid border-2 border-gray-200">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 flex justify-center items-center">Cron Server</h3>
            <form class="flex flex-col space-y-6" on:submit={submitHandler}>
                {#if $formState === 'login'}
                    <div>
                        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0">Sign In</h3>
                        <Label class="space-y-2 mt-3.5">
                            <span>Your email</span>
                            <Input type="email" name="email" placeholder="name@company.com" required bind:value={email}/>
                        </Label>
                        <Label class="space-y-2 mt-3.5">
                            <span>Your password</span>
                            <Input type="password" name="password" placeholder="•••••" required bind:value={password}/>
                        </Label>
                        <div class="flex items-start mt-3.5">
                            <Checkbox>Remember me</Checkbox>
                        </div>
                        <a href="/" class="flex items-start justify-start text-sm text-blue-700 hover:underline dark:text-blue-500 mt-3.5">Forgot password?</a>
                        <Button on:click={() => mode = 'login'} type="submit" class="w-full mt-3.5">Sign in</Button>
                        <p class="text-sm font-light text-gray-500 dark:text-gray-400 mt-3.5">
                            Don’t have an account yet? <a on:click={() => formChange('signup')} class="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
                        </p>
                    </div>
                {:else}
                    <div>
                        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0">Create account</h3>
                        <Label class="space-y-2 mt-3.5">
                            <span>Your email</span>
                            <Input type="email" name="email" placeholder="name@company.com" required bind:value={email}/>
                        </Label>
                        <Label class="space-y-2 mt-3.5">
                            <span>Your password</span>
                            <Input type="password" name="password" placeholder="•••••" required bind:value={password} />
                        </Label>
                        <Button on:click={() => mode = 'signup'} type="submit" class="w-full mt-3.5">Create an account</Button>
                        <p class="text-sm font-light text-gray-500 dark:text-gray-400 mt-3.5">
                            Already have an account?
                            <a on:click={() => formChange('login')} class="font-medium text-primary-600 hover:underline dark:text-primary-500 mt-3.5">Login here</a>
                        </p>
                    </div>
                {/if}
            </form>
        </div>
    </div>
</div>
