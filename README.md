# Cron Server

The Cron Server is CRON management server with a Restful API. It consists of 4 modules Users, Accounts, Jobs and Responses.

## Users

Users are administrators with access to the UI. There isn't any roles system so each user has permission to perform
any actions in the platform including adding and removing other users.

## Accounts

An account is an application using the API. It's a name and API Key pair that authenticates with the app using basic authentication.

## Jobs

Jobs are the core of the application. A job is a CRON along with information for the request that should be sent in each invocation.

## Responses

Each invocation of a job creates a response, this contains the status and time as well as optionally the returned request
body and headers.
