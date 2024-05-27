<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { Button, Modal, Input, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
  import { goto } from '$app/navigation';

  let accounts = writable([]);
  let showModal = writable(false);
  let editAccount = writable(null);
  let newAccount = writable({ name: '', description: '', apiKey: '' });

  const API_BASE_URL = 'http://localhost:3000/api/accounts';

  const fetchAccounts = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const data = await response.json();
      accounts.set(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const createAccount = async () => {
    try {
      const newAccountData = $newAccount;
      console.log('New Account Data:', newAccountData);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(newAccountData),
      });

      console.log(response);

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      const createdAccount = await response.json();

      console.log(createdAccount);
      accounts.update(current => [...current, createdAccount]);
      newAccount.set({ name: '', description: '', apiKey: '' });
      showModal.set(false);

      console.log(accounts);
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const updateAccount = async (account) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${account._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(account),
      });

      if (!response.ok) {
        throw new Error('Failed to update account');
      }

      await fetchAccounts();
      editAccount.set(null);
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const deleteAccount = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      await fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const viewJobs = (id) => {
    goto(`/jobs/${id}`);
  };

  onMount(() => {
    fetchAccounts();
  });
</script>

<div class="container mx-auto p-4">
    <div class="mb-4">
        <Button on:click={() => showModal.set(true)}>Create Account</Button>
    </div>

    <Modal bind:open={$showModal} title="Create Account">
        <div>
            <Input class="mb-2" bind:value={$newAccount.name} placeholder="Name*" />
            <Input class="mb-2" bind:value={$newAccount.description} placeholder="Description" />
            <Input class="mb-2" bind:value={$newAccount.apiKey} placeholder="API Key*" />
        </div>
        <Button on:click={createAccount}>Save</Button>
    </Modal>

    <Table>
        <TableHead>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell class="text-right">Actions</TableHeadCell>
        </TableHead>
        <TableBody tableBodyClass="divide-y">
            {#if $accounts.length === 0}
                <p>Create your first account...</p>
            {/if}
            {#each $accounts as account}
                <TableBodyRow>
                    <TableBodyCell>{account.name}</TableBodyCell>
                    <TableBodyCell class="text-right">
                        <Button on:click={() => editAccount.set(account)}>Edit</Button>
                        <Button on:click={() => deleteAccount(account._id)}>Delete</Button>
                        <Button on:click={() => viewJobs(account._id)}>View Jobs</Button>
                    </TableBodyCell>
                </TableBodyRow>
            {/each}
        </TableBody>
    </Table>

    {#if $editAccount}
        <Modal bind:open={$editAccount} title="Edit Account">
            <div>
                <Input bind:value={$editAccount.name} placeholder="Name" />
                <Input bind:value={$editAccount.description} placeholder="Description" />
                <Input bind:value={$editAccount.apiKey} placeholder="API Key" />
            </div>
            <Button on:click={() => updateAccount($editAccount)}>Save</Button>
        </Modal>
    {/if}
</div>
