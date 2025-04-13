# MindSync

![image](https://github.com/user-attachments/assets/0c986dcb-c45c-4354-b498-7e4897375b48)

## Problem Statement

Traditional social networking often leads to surface-level connections and fragmented conversations. MindSync addresses this by facilitating meaningful interactions through a system of weekly themed questions that reveal users' personalities and interests. By grouping individuals based on their responses, MindSync fosters authentic discussions and long-term relationships, combating digital isolation and shallow engagements.

## Libraries Used

- **Frontend:**
  - **Next.js:** For server-side rendering, routing, and building a responsive, performant user interface.
  - **React-Query:** For efficient server state management and data fetching with automatic caching and background updates.
  - **Gemini-Pro:** Google's large language model API for generating icebreakers in new chats
- **Backend:**
  - **⚠️ TO ACCESS LATEST SERVER DIRECTORY, GO TO BRANCH AI/ML**
  - **Supabase:** As our backend-as-a-service for data management, authentication, and real-time database functionalities.
  - **FastAPI:** To power our custom grouping algorithm and serve as a robust API layer.
  - **HuggingFace:** For accessing pre-trained NLP models to analyze user responses and extract personality traits.
  - **PyTorch:** Deep learning framework used for custom model training and inference in our personality analysis pipeline.
- **Additional Tools:**
  - Task schedulers (e.g., cron jobs) for automating the weekly question release and group activation cycle.

## Demo

Watch our live demo or explore a guided tour of MindSync:

## Members

- **Kareem Sinan**
- **Nathan Allen**
- **Hashem AlSailani**
- **Mustafa Mannan**

We're excited for you to experience MindSync, a platform where meaningful conversations spark genuine connections.
