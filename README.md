# Description

This is a simple authentication REST API, using JWT (JSON Web Token) to control user sessions.
And with some other features like creating an address and phone number for a registered user,
password reset and email verification with AWS-SES to send emails. This project was created using the SOLID principles and the
TDD Methodology

---

## How install

```bash

   # Clone the repository
   $ git clone https://github.com/RodSilvaSoul/simple-auth-backend.git

   # run yarn for install the project dependencies
   $ yarn

   # or with npm
   $ npm install

   # run the docker-compose file
   $ sudo docker-compose up -d

   # run the typeorm migrations
   $ yarn run typeorm migration:run

   #or with npm
   $ npm run typeorm migration:run
```

### Ambient variables

Now fill the environment variables into an .env file, using .env.example as a template.

[.env.example](./.env.example)

```md
## AWS Credentials

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

## API URLs

FORGOT_MAIL_URL=
VERIFY_EMAIL_URL=
```

---

## Technologies used

The project was developed using the following technologies

- [express](https://expressjs.com)
- [typescript](https://www.typescriptlang.org)
- [day.js](https://day.js.org)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [nodemailer](https://nodemailer.com/about/)
- [typeorm](https://typeorm.io)
- [tsyringe](https://github.com/microsoft/tsyringe)
- [AWS-SES](https://aws.amazon.com/pt/ses/)
- [postgresql](https://www.postgresql.org)

### The Either type

In this project I'm using a type called Either, very useful to handle validations using the typescript typing system.

```typescript
type Either<E, A> = Left<E> | Right<A>;
```

Represents a value of one of two possible types (a disjoint union).

An instance of Either is either an instance of Left or Right.

A common use of Either is as an for dealing with possible missing values. In this usage, Left is used for failure and Right is used for success.

#### Example

Imagine a scenario where you need to validate the data of a user and return an error if there is an invalid data or in the successful case return the data back. A possible implementation using the Either type would be:

```typescript
   function userDataValidation(data:User):Either<Error,User> {
       ...some validation code

       if(valid) {
           return right(data)
       }

       return left(new SomeError())
   }
```

When we call the function passing the user data, the result will be an instance of the Left or Right classes, returned by the function using two helpers functions (left() and right()), The two classes implement two methods (isLeft() or isRight()) so that we can identify which of these two classes was returned from the function, and thus we can see if it was successful or an error in data validation.

```typescript
const result = userDataValidation(data);

if (result.isLeft()) {
  console.log('Error in the data validation');
}

if (result.isRight()) {
  console.log('The user data is valid');
}
```

With the value property of the classes we can retrieve the values ​​passed to the left() and right() functions.

```typescript
const result = userDataValidation(data);

if (result.isRight()) {
  console.log('The user data is valid');
  console.log(result.value);
  //prints the object containing the user data
}

if (result.isRight()) {
  console.log('The user data is valid');
  console.log(result.value);
  //prints the Error class instance
}
```

[Implementation of the Either type](./src/shared/utils/either.ts)

### Tsyringe library

Is a A lightweight dependency injection container for TypeScript/JavaScript for constructor injection.
With this library we can have a simple way of dependency injection leaving the code cleaner and have a,
way to concentrate all the instances in the same place. Besides we can use design patterns like singleton
and make the implementation of SOLID principles easier. The library uses decorators to achieve this goal.

All instancies of class using the Tsyringe container of the project can be found in the folder:
[container folder](./src/shared/container)

---

## Solid principles used

- Single Responsibility Principle (SRP)
- Open Closed Principle (OCP)
- Liskov Substitution Principle (LSP)
- Interface Segregation Principle (ISP)
- Dependency Inversion Principle (DIP)

---

## Design Patterns used

- Facade Design Pattern
- Adapter Design Pattern

---

## Routes of the API

- base url : /api/v1

  - user routes:
    - /users: For create a new user
  - password routes:
    - /password/rest : For reset the password user in the database
    - /password/forgot : For send the email of reset password for the user
  - authenticate routes:
    - auth/sessions: For start a new user session
    - auth/refresh-token: For validate the refresh token and send a new access token back
  - address routes: (must be sent a access token using the Bearer in the request)
    - /address/create:id : For create a new address user by id
    - /address/update:id : For update a new address user by id
  - phone routes: (must be sent a access token using the Bearer in the request)
    - /phone/create:id : For create a new phone user by id
    - /phone/update:id : For update a new phone user by id
  - email routes:
    - /email/send-email: For sent the email for verify the user email address
    - /email/verify-email: For update the user.isEmailVerified field in the database table to true
