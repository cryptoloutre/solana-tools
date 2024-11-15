# Solana-Tools

A bunch of tools to help people in the Solana ecosystem. This website includes:
- a UI to burn Solana NFTs
- a UI to burn SPL-tokens
- a UI to close empty accounts
- a multi sender (a UI to send multiple tokens in 1 transaction (same token to different people/many tokens to one person/transfer solana domain name)
- a UI to create SPL-Tokens
- a UI to upload file to Arweave
- a UI to update the metadata of your NFT
- a UI to send a NFT message to the owner of your desired NFT or solana domain name
- More tools are scheduled...

Download our xNFT [here](https://test.xnft.gg/app/621U7cWfav4ypS7e7uxdXcZTjTFgkeXW48sRReoFewg9). Find the source code of our xNFT just [here](https://github.com/cryptoloutre/solana-tools-xnft).
    

## Demo:
- Mainnet: https://solanatools.vercel.app/
- Devnet: https://solanatools-devnet.vercel.app/

## Tips
Donations can be made at `solanatools.sol` if you are feeling generous and want to support me!

## Getting Started

Clone the repo, install the dependencies and run `yarn run dev` to run the development server.

```bash
git clone https://github.com/cryptoloutre/solana-tools.git
cd solana-tools
yarn install
yarn run dev
```


## Burn NFT UI
A UI for burning Solana NFTs and getting back $SOL from the associated token account.


https://user-images.githubusercontent.com/35653371/158780601-3f17deb7-55e9-488f-aa44-279b11ca071a.mp4

## Burn SPL-tokens UI
A UI for burning SPL-tokens and getting back $SOL from the associated token account.


https://user-images.githubusercontent.com/35653371/183292063-5ada43f5-9212-46cf-afae-7ce3cf80e8f9.mp4


## Close empty account UI
A UI to close empty token account and getting back $SOL from the associated token account.


https://user-images.githubusercontent.com/35653371/183292119-6b8de305-f5af-4039-ab6e-8d46cbb82857.mp4

## Multi sender UI
A UI to send multiple tokens in 1 transaction (same token to different people/many tokens to one person/transfer solana domain name)


https://user-images.githubusercontent.com/35653371/183292184-7397b437-742d-4cdd-a8e5-744c31a479b3.mp4


https://user-images.githubusercontent.com/35653371/183292191-c3fc22f7-4add-4f64-b441-14c66dc9d8b8.mp4





## Create SPL-Tokens UI
An UI to create SPL-Tokens with one click.




https://user-images.githubusercontent.com/35653371/174244099-a3338093-0d77-49ad-b372-401ec069486e.mp4



## Upload File
An UI to upload file to Arweave.


https://user-images.githubusercontent.com/35653371/174040530-3a4a16a3-26de-4c8a-b7c8-67908c3b377d.mp4

## Update NFT metadata UI
An UI to update the metadata of your NFT


https://user-images.githubusercontent.com/35653371/187695118-2d2e90f2-0b78-48ea-8096-b9729dc9c1c9.mp4



## Send NFT message
An UI to send a NFT message to the owner of your desired NFT



https://user-images.githubusercontent.com/35653371/174803502-cc1fa39d-691f-4c91-b9ca-a1661b0cd1ac.mp4



## Style

[Tailwind CSS](https://tailwindcss.com/) or [daisyUI](https://daisyui.com/) are selected tools for rapid style development.

You can quickly change theme changing `daisy.themes` within `./tailwind.config.js`.
More info here: https://daisyui.com/docs/default-themes

This app encourages you to use CSS Modules over other style techniques (like SASS/LESS, Styled Components, usual CSS).
It has a modular nature and supports modern CSS. [Read more on Next.JS site](https://nextjs.org/docs/basic-features/built-in-css-support).
Anyway, if you want to connect LESS there is example code in `./next.config.js`

## Deploy on Vercel

Before push run locally `npm run build` to make sure app can be build successfully on vercel.

Vercel will automatically create environment and deployment for you if you have vercel account connected to your GitHub account. Go to the vercel.com to connect it.
Then any push to `main` branch will automatically rebuild and redeploy app.

To deploy on Vercel use the following settings :

<p align="center">
<img src="https://user-images.githubusercontent.com/35653371/157638049-4944f065-5985-4a35-bbe6-e46efc984737.png"/>
</p>


## Community
If you have questions or any troubles, feel free to reach me on X (formerly Twitter) [@laloutre](https://x.com/laloutre).
