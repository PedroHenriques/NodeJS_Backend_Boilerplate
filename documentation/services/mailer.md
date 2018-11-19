# mailer

## Overview

This service is responsible for all email related operations, specificaly sending emails.

## Configuration

By default emails are sent using an SMTP transport, which is configured in the `mailer/handlers/mailer.ts` file in the `smtpConfig` constant.

## Socket Server

This service will create a socket server, to which other services can connect to, and will listen to the following events:  

### `mailerSendEmail`

Send an email.  
Expects a payload in the format:

```js
{
  from: {
    name: string,
    address: string,
  },
  to: string,
  subject: string,
  body: {
    plain?: string,
    html: string,
  },
}
```

If a callback is provided, it will be called with an object with the information of the sent emails, as the `value` argument.

## Event Dispatchers

The recommended way to dispatch events to this service is to use the available **event dispatchers** for the mailer related events.  

Theses functions are located in the `sharedLibs/utils/mailerEventDispatchers.ts` file, which should be available to all services.

## Email templates

This boilerplate doesn't include any templating engine. Instead email templates are handled with factory functions and string literals.  

Examples of this implementation can be seen in the `webServer/templates/emails/` directory.