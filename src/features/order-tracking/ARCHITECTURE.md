# Order Tracking System Architecture

## For Edakkattu Furniture and Teakacacia LLP

## System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  WordPress      │◄────┤  GraphQL API    │◄────┤  React Frontend │
│  Admin          │     │                 │     │                 │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Order          │     │  Email          │     │  Tracking       │
│  Database       │     │  Service        │     │  UI             │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 │
                        ┌────────┴────────┐
                        │                 │
                        │  Email          │
                        │  Templates      │
                        │                 │
                        └─────────────────┘
```

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Order      │────►│  Status     │────►│  Email      │────►│  Customer   │
│  Created    │     │  Updated    │     │  Sent       │     │  Notified   │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Frontend (React)                                               │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        │
│  │             │     │             │     │             │        │
│  │  TrackOrder │     │  OrderDetail│     │  Timeline   │        │
│  │  Component  │────►│  Component  │────►│  Component  │        │
│  │             │     │             │     │             │        │
│  └─────────────┘     └─────────────┘     └─────────────┘        │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ GraphQL Queries
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Backend (Node.js/Express)                                      │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        │
│  │             │     │             │     │             │        │
│  │  API        │     │  Email      │     │  Template   │        │
│  │  Endpoints  │────►│  Service    │────►│  Renderer   │        │
│  │             │     │             │     │             │        │
│  └─────────────┘     └─────────────┘     └─────────────┘        │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ SMTP
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Email Delivery                                                 │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐                            │
│  │             │     │             │                            │
│  │  Gmail      │────►│  Customer   │                            │
│  │  SMTP       │     │  Inbox      │                            │
│  │             │     │             │                            │
│  └─────────────┘     └─────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  /api/orders/:orderId (GET)                                     │
│  └── Get order details                                          │
│                                                                 │
│  /api/orders/update-status (POST)                               │
│  └── Update order status                                        │
│      └── Triggers email notifications                           │
│                                                                 │
│  /api/orders/:orderId/history (GET)                             │
│  └── Get status history                                         │
│                                                                 │
│  /api/orders/:orderId/resend-notification (POST)                │
│  └── Resend notifications                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Email Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Status     │────►│  Template   │────►│  Email      │────►│  Delivery   │
│  Change     │     │  Selection  │     │  Queue      │     │  Attempt    │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                   │
                                                                   │
                    ┌─────────────┐     ┌─────────────┐            │
                    │             │     │             │            │
                    │  Success    │◄────┤  Retry      │◄───────────┘
                    │  Logging    │     │  Logic      │
                    │             │     │             │
                    └─────────────┘     └─────────────┘
```

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **Email**: Nodemailer, Gmail SMTP, Handlebars
- **API**: RESTful endpoints, GraphQL
- **Data Storage**: WooCommerce/WordPress database
