<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/utils/state';

  let newPassword = '';

  let hash = '';
  onMount(() => {
    const queryParams = new URLSearchParams(window.location.search);
    hash = queryParams.get('hash') || '';
  });

  async function updatePassword() {
    try {
      const response = await fetch(`/api/users/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash, newPassword }),
      });

      if (response.ok) {
        goto('/login');
      } else {
        const errorData = await response.json();
        console.error('Password update failed:', errorData.message);
      }
    } catch (error) {
      console.error('Password update failed:', error);
    }
  }
</script>

<h1>Reset Password</h1>

{#if hash}
    <form on:submit|preventDefault={updatePassword}>
        <label>
            New Password:
            <input type="password" bind:value={newPassword} required />
        </label>
        <button type="submit">Submit</button>
    </form>
{:else}
    {#if $user}
        {#if $user.token}
            {goto('/dashboard')}
        {:else}
            {goto('/login')}
        {/if}
    {:else}
        {goto('/login')}
    {/if}
{/if}