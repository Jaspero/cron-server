<script lang="ts" context="module">
  import { Button, Checkbox, Label, Input } from "flowbite-svelte";
  import { emailValidator, requiredValidator } from './validators.js'
  import { createFieldValidator } from './validation.js'
  import {writable} from "svelte/store";

  const [validity, validate] = createFieldValidator(requiredValidator(), emailValidator());

  let email = '';
  let password = '';
  let formState = writable('login');

  function formChange(src: string) {
    formState.set(src);
  }

  /*$: submit = async () => {
    await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
  }*/

</script>
<div class="flex justify-center items-center">
    <div class="login-form w-96 my-24 border-solid border-2 border-gray-200">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 flex justify-center items-center">Cron Server</h3>
            <form class="flex flex-col space-y-6" action="/">
                {#if $formState === 'login'}
                    <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0">Sign In</h3>
                    <Label class="space-y-2">
                        <span>Your email</span>
                        <Input type="email" name="email" placeholder="name@company.com" required bind:value={email}/>
                    </Label>
                    <Label class="space-y-2">
                        <span>Your password</span>
                        <Input type="password" name="password" placeholder="•••••" required bind:value={password}/>
                    </Label>
                    <div class="flex items-start">
                        <Checkbox>Remember me</Checkbox>
                    </div>
                    <a href="/" class="flex items-start justify-start text-sm text-blue-700 hover:underline dark:text-blue-500">Forgot password?</a>
                    <Button type="submit" class="w-full1">Sign in</Button>
                    <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                        Don’t have an account yet? <a on:click={() => formChange('signup')} class="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
                    </p>
                {:else}
                    <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0">Create account</h3>
                    <Label class="space-y-2">
                        <span>Your email</span>
                        <Input type="email" name="email" placeholder="name@company.com" required bind:value={email}/>
                    </Label>
                    <Label class="space-y-2">
                        <span>Your password</span>
                        <Input type="password" name="password" placeholder="•••••" required bind:value={password} />
                    </Label>
                    <Button type="submit" class="w-full1">Create an account</Button>
                    <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                        Already have an account?
                        <a on:click={() => formChange('login')} class="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</a>
                    </p>
                {/if}
            </form>
        </div>
    </div>
</div>
