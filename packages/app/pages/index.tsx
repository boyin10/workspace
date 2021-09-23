import { Dialog, Transition } from '@headlessui/react';
import FacebookPixel from 'components/FacebookPixel';
import { CatPool } from '@popcorn/ui/components/CatPool';
import { Rocket } from '@popcorn/ui/components/Rocket';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useState } from 'react';
import { Facebook, GitHub, Menu, Twitter, X } from 'react-feather';

const IndexPage = () => {
  const router = useRouter();
  const endDate = 1635688800000; //Oct 31, 15.00.00 Berlin Time
  const [countdown, setCountdown] = useState<number[]>([]);
  const [countdownActive, disableCountdown] = useState<boolean>(true);
  const [menuVisible, toggleMenu] = useState<boolean>(false);
  const [ctaModalVisible, toggleCtaModal] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  useEffect(() => {
    if (countdownActive) {
      setInterval(function () {
        const now = new Date().getTime();

        const distance = endDate - now;
        if (distance < 0) {
          disableCountdown(false);
          setCountdown([0, 0, 0, 0]);
        }

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown([days, hours, minutes, seconds]);
      }, 1000);
    }
  }, []);

  return (
    <div className="font-landing">
      <FacebookPixel />
      {/* Modal to display signup form*/}
      <Transition.Root show={ctaModalVisible} as={Fragment}>
        <Dialog
          as="div"
          auto-reopen="true"
          className="fixed z-10 inset-0 overflow-y-auto"
          onClose={(e) => toggleCtaModal(false)}
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-60 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                style={{ backdropFilter: 'blur(5px)' }}
              />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="w-full md:w-1/2 xl:w-1/3 inline-block transform transition-all align-middle">
                <form
                  action="https://network.us1.list-manage.com/subscribe/post?u=5ce5e82d673fd2cfaf12849a5&amp;id=e85a091ed3"
                  method="post"
                  id="mc-embedded-subscribe-form"
                  name="mc-embedded-subscribe-form"
                  className="validate"
                  target="_blank"
                  noValidate
                >
                  <div
                    id="mc_embed_signup_scroll"
                    className="shadow-xl bg-white rounded-xl py-2 px-2 mt-8 w-full flex flex-col md:flex-row items-center justify-between"
                  >
                    <input
                      type="email"
                      name="EMAIL"
                      className="w-10/12 p-2 text-base mx-4 text-gray-900"
                      id="mce-EMAIL"
                      placeholder="Email Address"
                      required
                    />
                    <div
                      style={{ position: 'absolute', left: '-5000px' }}
                      aria-hidden="true"
                    >
                      <input
                        type="text"
                        name="b_5ce5e82d673fd2cfaf12849a5_e85a091ed3"
                        tabIndex={-1}
                      />
                    </div>
                    <div className="clear">
                      <input
                        type="submit"
                        value="Join Waitlist"
                        name="subscribe"
                        id="mc-embedded-subscribe"
                        className="font-medium text-base bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 mt-4 md:mt-0 cursor-pointer"
                        readOnly
                        onClick={(e) => toggleCtaModal(false)}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      {/* DESKTOP + TABLET VERSION */}
      <div className="hidden lg:flex flex-col w-full h-full">
        <header className="w-full bg-primary">
          <nav className="w-10/12 mx-auto pt-12 pb-4 border-b border-primaryLight flex flex-row items-center justify-between">
            <div>
              <Link href="/" passHref>
                <a>
                  {/*TODO The logo is slightly blurred even though its copied straight from figma*/}
                  <img
                    src="/images/textLogo.png"
                    alt="Logo"
                    className="h-12"
                  ></img>
                </a>
              </Link>
            </div>
            <div className="space-x-8">
              {/*<Link href="/" passHref>
              <a className="font-medium text-base hover:text-blue-600">
                About us
              </a>
            </Link>*/}
              {/*<Link href="/" passHref>
              <a className="font-medium text-base hover:text-blue-600">
                Products
              </a>
            </Link>*/}
              <Link href="/docs/Popcorn_whitepaper_v1.pdf" passHref>
                <a
                  className="font-medium text-base hover:text-blue-600"
                  target="_window"
                >
                  Whitepaper
                </a>
              </Link>
              {/*<Link href="/" passHref>
              <a className="font-medium text-base hover:text-blue-600">
                PopcornDAO
              </a>
            </Link>*/}
              <a
                className="font-medium text-base bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-4 cursor-pointer"
                onClick={(e) => toggleCtaModal(true)}
              >
                Early Access
              </a>
            </div>
          </nav>
        </header>
        <section className="max-h-screen min-h-full">
          <div className="bg-primary w-full h-8 2xl:h-28"></div>
          <div
            className="bg-hero-pattern flex-shrink-0 flex-grow-0 w-full h-full"
            style={{
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="w-10/12 mx-auto flex flex-col lg:flex-row justify-between pb-48 items-center">
              <div className="w-full lg:w-6/12 xl:w-5/12 order-2 lg:order-1">
                <div className="w-10/12 text-center mx-auto lg:text-left lg:mx-0">
                  <h1 className="font-bold lg:text-5xl xl:text-7xl leading-snug mb-8 ">
                    Start doing good with DeFi
                  </h1>
                  <p className="text-2xl font-landing">
                    Earn high yield on your cryptoassets while creating real
                    world impact. Our earnings fund social impact organizations.
                  </p>
                  <form
                    action="https://network.us1.list-manage.com/subscribe/post?u=5ce5e82d673fd2cfaf12849a5&amp;id=e85a091ed3"
                    method="post"
                    id="mc-embedded-subscribe-form"
                    name="mc-embedded-subscribe-form"
                    className="validate"
                    target="_blank"
                    noValidate
                  >
                    <div
                      id="mc_embed_signup_scroll"
                      className="shadow-xl bg-white rounded-xl py-2 px-2 mt-8 w-full flex flex-row items-center justify-between"
                    >
                      <input
                        type="email"
                        name="EMAIL"
                        className="w-10/12 p-2 text-base mx-4 text-gray-900"
                        id="mce-EMAIL"
                        placeholder="Email Address"
                        required
                      />
                      <div
                        style={{ position: 'absolute', left: '-5000px' }}
                        aria-hidden="true"
                      >
                        <input
                          type="text"
                          name="b_5ce5e82d673fd2cfaf12849a5_e85a091ed3"
                          tabIndex={-1}
                        />
                      </div>
                      <div className="clear">
                        <input
                          type="submit"
                          value="Join Waitlist"
                          name="subscribe"
                          id="mc-embedded-subscribe"
                          className="font-medium text-base bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 cursor-pointer"
                          readOnly
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="w-full lg:w-6/12 xl:w-7/12 order-1 lg:order-2 mb-8 lg:mb-0">
                <CatPool />
              </div>
            </div>
            <div className="w-full h-24"></div>
          </div>
        </section>
        <section className="w-10/12 mx-auto mb-24">
          <h2 className="font-bold text-5xl xl:text-6xl mb-4">How it works</h2>
          <p className="text-2xl font-landing text-gray-500">
            Put your cryptoassets to work
          </p>
          <div className="w-full flex flex-wrap xl:flex-row justify-between mt-16">
            <div className="w-1/2 xl:w-1/4 flex-grow-0 flex-shrink-0 mb-12 xl:mb-0">
              <div className="w-11/12 h-104 rounded-xl shadow-2xl flex flex-col items-center">
                <div className="w-36 h-36 rounded-full bg-primary mt-12 flex items-center">
                  <img
                    src="/images/metamaskCat.svg"
                    alt="metamaskCat"
                    className="mx-auto mb-1"
                  ></img>
                </div>
                <h3 className="font-medium text-4xl py-8">Connect</h3>
                <p className="w-3/4 text-center text-xl text-gray-500">
                  Connect your Metamask wallet with Popcorn
                </p>
              </div>
            </div>
            <div className="w-1/2 xl:w-1/4 flex-grow-0 flex-shrink-0 mb-12 xl:mb-0">
              <div className="w-11/12 h-104 rounded-xl shadow-2xl flex flex-col items-center">
                <div className="w-36 h-36 rounded-full bg-primary mt-12 flex items-center">
                  <img
                    src="/images/vault.svg"
                    alt="vault"
                    className="mx-auto mb-2"
                  ></img>
                </div>
                <h3 className="font-medium text-4xl py-8">Deposit</h3>
                <p className="w-3/4 text-center text-xl text-gray-500">
                  Deposit your crypto and choose a product or strategy
                </p>
              </div>
            </div>
            <div className="w-1/2 xl:w-1/4 flex-grow-0 flex-shrink-0">
              <div className="w-11/12 h-104 rounded-xl shadow-2xl flex flex-col items-center">
                <div className="w-36 h-36 rounded-full bg-primary mt-12 flex items-center">
                  <img
                    src="/images/popcornVault.svg"
                    alt="popcornVault"
                    className="mx-auto mt-2"
                  ></img>
                </div>
                <h3 className="font-medium text-4xl py-8">Do well</h3>
                <p className="w-3/4 text-center text-xl text-gray-500">
                  Earn competitive returns on your crypto assets
                </p>
              </div>
            </div>
            <div className="w-1/2 xl:w-1/4 flex-grow-0 flex-shrink-0">
              <div className="w-11/12 h-104 rounded-xl shadow-2xl flex flex-col items-center">
                <div className="w-36 h-36 rounded-full bg-primary mt-12 flex items-center">
                  <img
                    src="/images/catMail.svg"
                    alt="catMail"
                    className="mx-auto mb-1"
                  ></img>
                </div>
                <h3 className="font-medium text-4xl py-8">Do good</h3>
                <p className="w-3/4 text-center text-xl text-gray-500">
                  Choose which social impact organization you’d like to help
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          className="bg-popcorn1-pattern flex-shrink-0 flex-grow-0 w-full h-full xl:mb-24"
          style={{
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'auto',
            backgroundPosition: 'left top',
          }}
        >
          <div className="w-10/12 mx-auto pt-20 flex flex-row justify-between items-center">
            <div className="w-5/12">
              <h2 className="w-11/12 font-bold text-5xl xl:text-6xl leading-snug mb-4">
                Maximize your Crypto Portfolio
              </h2>
              <p className="text-2xl font-landing text-gray-500">
                Popcorn offers a suite of DeFi products and hedge fund
                strategies for you to generate competitive returns on your
                crypto assets.
              </p>
              <img
                src="/images/bgPopcorn2.svg"
                alt="bgPopcorn2"
                className="mx-auto"
              ></img>
            </div>
            <div className="w-6/12">
              <Rocket />
            </div>
          </div>
        </section>
        <section className="bg-impact-pattern flex-shrink-0 flex-grow-0 w-full h-full py-40 xl:py-104 impact-background">
          <div className="w-10/12 mx-auto flex flex-row justify-between items-center">
            <div className="w-7/12 2xl:w-8/12"></div>
            <div className="w-5/12 2xl:w-4/12">
              <h2 className="font-bold text-5xl xl:text-6xl leading-snug mb-4 2xl:w-9/12">
                Create Real World Impact
              </h2>
              <p className="text-2xl font-landing text-gray-500 2xl:w-10/12">
                Our profits fund social impact organizations. Choose which
                initiatives you support:
              </p>
              <ul className="list-inside list-disc mt-8 space-y-3">
                <li className="text-2xl font-medium font-landing">
                  Environment
                </li>
                <li className="text-2xl font-medium font-landing">
                  Open Source
                </li>
                <li className="text-2xl font-medium font-landing">Education</li>
              </ul>
            </div>
          </div>
        </section>
        <section
          className="bg-popcorn3-pattern flex-shrink-0 flex-grow-0 w-full h-full mb-24"
          style={{
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'auto',
            backgroundPosition: 'left top',
          }}
        >
          <div className="w-10/12 mx-auto pt-20 flex flex-row justify-between items-center">
            <div className="w-5/12">
              <h2 className="w-11/12 font-bold text-5xl xl:text-6xl leading-snug mb-4">
                While Remaining Carbon Neutral
              </h2>
              <p className="text-2xl font-landing text-gray-500">
                Popcorn calculates and neutralizes blockchain carbon emissions
                by partnering with carbon sequestration and negative emission
                projects.
              </p>
            </div>
            <div className="w-6/12">
              <img src="/images/tree.svg" alt="tree" className=""></img>
            </div>
          </div>
        </section>
        <section>
          <div
            className="bg-countdown-pattern flex-shrink-0 flex-grow-0 w-full
          h-full pt-60"
            style={{
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'auto',
              backgroundPosition: 'center',
            }}
          >
            <div className="w-full pt-32">
              <div className="w-10/12 mx-auto rounded-xl shadow-xl bg-white">
                <h3 className="font-medium text-4xl pt-20 pb-12 text-center">
                  Don’t miss the liquidity event!
                </h3>
                <div className="w-9/12 mx-auto flex flex-row justify-between pb-20">
                  <div className="text-center">
                    <h1 className="font-bold text-7xl leading-snug">
                      {countdown[0]}
                    </h1>
                    <p className="text-3xl font-landing text-gray-500">Days</p>
                  </div>
                  <div className="text-center">
                    <h1 className="font-bold text-7xl leading-snug">
                      {countdown[1]}
                    </h1>
                    <p className="text-3xl font-landing text-gray-500">Hours</p>
                  </div>
                  <div className="text-center">
                    <h1 className="font-bold text-7xl leading-snug">
                      {countdown[2]}
                    </h1>
                    <p className="text-3xl font-landing text-gray-500">
                      Minutes
                    </p>
                  </div>
                  <div className="text-center">
                    <h1 className="font-bold text-7xl leading-snug">
                      {countdown[3]}
                    </h1>
                    <p className="text-3xl font-landing text-gray-500">
                      Seconds
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-secondary py-52">
          <div className="w-8/12 mx-auto text-center">
            <h2 className="font-bold text-4xl leading-snug mb-4">Notify Me</h2>
            <p className="text-2xl font-medium">
              Can’t wait to see you when we are launching. Get earlier
              notification to be part of our journey
            </p>
            <form
              action="https://network.us1.list-manage.com/subscribe/post?u=5ce5e82d673fd2cfaf12849a5&amp;id=e85a091ed3"
              method="post"
              id="mc-embedded-subscribe-form"
              name="mc-embedded-subscribe-form"
              className="validate"
              target="_blank"
              noValidate
            >
              <div
                id="mc_embed_signup_scroll"
                className="shadow-xl bg-white rounded-xl py-2 px-2 mt-8 w-8/12 mx-auto flex flex-row items-center justify-between"
              >
                <input
                  type="email"
                  name="EMAIL"
                  className="w-10/12 p-2 text-base mx-4 text-gray-900"
                  id="mce-EMAIL"
                  placeholder="Email Address"
                  required
                />
                <div
                  style={{ position: 'absolute', left: '-5000px' }}
                  aria-hidden="true"
                >
                  <input
                    type="text"
                    name="b_5ce5e82d673fd2cfaf12849a5_e85a091ed3"
                    tabIndex={-1}
                  />
                </div>
                <div className="clear">
                  <input
                    type="submit"
                    value="Join Waitlist"
                    name="subscribe"
                    id="mc-embedded-subscribe"
                    className="font-medium text-base bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 cursor-pointer"
                    readOnly
                  />
                </div>
              </div>
            </form>
          </div>
        </section>
        <section className="w-full bg-secondary">
          <div className="w-10/12 mx-auto flex flex-row justify-between border-b border-gray-500 pb-12">
            <div className="w-6/12">
              <Link href="/" passHref>
                <a>
                  {/*TODO The logo is slightly blurred even though its copied strcmdaight from figma*/}
                  <img src="/images/logo.png" alt="Logo" className="h-10"></img>
                </a>
              </Link>
              <p className="font-medium text-base w-7/12 py-4">
                Popcorn is a carbon-neutral crypto savings account where fees
                fund educational, environmental and open source initiatives
              </p>
              <div className="flex flex-row space-x-4 items-center">
                <Link href="https://github.com/popcorndao" passHref>
                  <GitHub className="hover:text-blue-600 cursor-pointer" />
                </Link>
                <Link href="https://www.facebook.com/PopcornDAO" passHref>
                  <Facebook className="hover:text-blue-600 cursor-pointer" />
                </Link>
                <Link href="https://twitter.com/Popcorn_DAO" passHref>
                  <Twitter className="hover:text-blue-600 cursor-pointer" />
                </Link>
                <Link href="https://discord.gg/w9zeRTSZsq" passHref>
                  <img
                    src="/images/discord.svg"
                    alt="discord"
                    className="w-8 h-8 cursor-pointer discord"
                  ></img>
                </Link>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <p className="font-medium text-base uppercase">Site</p>
              <Link href="/" passHref>
                <a className="hover:text-blue-600">Home</a>
              </Link>
              {/*<Link href="/" passHref>
                <a className="hover:text-blue-600">About us</a>
              </Link>*/}
              <Link href="https://medium.com/popcorndao" passHref>
                <a className="hover:text-blue-600" target="_window">
                  Blog
                </a>
              </Link>
              <Link
                href="https://etherscan.io/token/0xd0cd466b34a24fcb2f87676278af2005ca8a78c4"
                passHref
              >
                <a className="hover:text-blue-600" target="_window">
                  Popcorn (POP) Token
                </a>
              </Link>
            </div>
            <div className="flex flex-col space-y-3">
              <p className="font-medium text-base uppercase">Connect</p>
              <Link href="https://twitter.com/Popcorn_DAO" passHref>
                <a className="hover:text-blue-600" target="_window">
                  Twitter
                </a>
              </Link>
              <Link href="https://discord.gg/w9zeRTSZsq" passHref>
                <a className="hover:text-blue-600" target="_window">
                  Discord
                </a>
              </Link>
              <Link href="https://github.com/popcorndao" passHref>
                <a className="hover:text-blue-600" target="_window">
                  Github
                </a>
              </Link>
            </div>
            {/*<div className="flex flex-col space-y-3">
            <p className="font-medium text-base uppercase">Documentation</p>
            <Link href="/" passHref>
              <a className="hover:text-blue-600">Gitbook</a>
            </Link>
          </div>*/}
          </div>
          <p className="font-base text-center py-4">
            ©2021, Popcorn Network. All Rights Reserved
          </p>
        </section>
      </div>
      {/* MOBILE VERSION */}
      <div className="w-full h-full lg:hidden">
        {menuVisible && (
          <div className="absolute z-10 w-screen">
            <div className="relative mx-auto mt-4 w-11/12 rounded-lg shadow-md bg-white px-4 pt-4 pb-6">

              <div className="flex flex-row justify-between items-center">
                <Link href="/" passHref>
                  <a>
                    {/*TODO The logo is slightly blurred even though its copied straight from figma*/}
                    <img
                      src="/images/logo.png"
                      alt="Logo"
                      className="h-14 flex-grow-0 flex-shrink-0"
                    ></img>
                  </a>
                </Link>
                <X
                  className="text-gray-500"
                  onClick={(e) => toggleMenu(false)}
                />
              </div>
              <div className="flex flex-col space-y-4 mt-4">
                {/*<Link href="/" passHref>
              <a className="font-medium text-base hover:text-blue-600">
                About us
              </a>
            </Link>*/}
                {/*<Link href="/" passHref>
              <a className="font-medium text-base hover:text-blue-600">
                Products
              </a>
            </Link>*/}
                <Link href="/docs/Popcorn_whitepaper_v1.pdf" passHref>
                  <a
                    className="font-medium text-base hover:text-blue-600"
                    target="_window"
                  >
                    Whitepaper
                  </a>
                </Link>
                {/*<Link href="/" passHref>
              <a className="font-medium text-base hover:text-blue-600">
                PopcornDAO
              </a>
            </Link>*/}
                <a
                  className="font-medium text-base bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-4"
                  onClick={(e) => {
                    toggleCtaModal(true);
                    toggleMenu(false);
                  }}
                >
                  Early Access
                </a>
              </div>
            </div>
          </div>
        )}
        <header className="w-full bg-primary">
          <nav className="w-10/12 mx-auto pt-12 pb-3 border-b border-primaryLight flex flex-row items-center justify-between">
            <div>
              <Link href="/" passHref>
                <a>
                  {/*TODO The logo is slightly blurred even though its copied straight from figma*/}
                  <img
                    src="/images/logo.png"
                    alt="Logo"
                    className="h-14 flex-grow-0 flex-shrink-0"
                  ></img>
                </a>
              </Link>
            </div>
            <Menu onClick={(e) => toggleMenu(true)} />
          </nav>
        </header>
        <section className="max-h-full min-h-full">
          <div className="bg-primary w-full h-12"></div>
          <div
            className="bg-hero-pattern flex-shrink-0 flex-grow-0 w-full h-full pt-6 md:pt-10"
            style={{
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="w-10/12 mx-auto flex flex-col lg:flex-row justify-between pb-48 items-center text-center">
              <CatPool />
              <h1 className="font-bold text-4xl leading-snug mb-8">
                Start doing good with DeFi
              </h1>
              <p className="text-lg font-landing">
                Earn high yield on your cryptoassets while creating real world
                impact. Our earnings fund social impact organizations.
              </p>
              <form
                action="https://network.us1.list-manage.com/subscribe/post?u=5ce5e82d673fd2cfaf12849a5&amp;id=e85a091ed3"
                method="post"
                id="mc-embedded-subscribe-form"
                name="mc-embedded-subscribe-form"
                className="validate"
                target="_blank"
                noValidate
              >
                <div
                  id="mc_embed_signup_scroll"
                  className="shadow-xl bg-white rounded-xl py-2 px-2 mt-8 w-full flex flex-row items-center justify-between"
                >
                  <input
                    type="email"
                    name="EMAIL"
                    className="w-10/12 p-2 text-base mx-4 text-gray-900"
                    id="mce-EMAIL"
                    placeholder="Email Address"
                    required
                  />
                  <div
                    style={{ position: 'absolute', left: '-5000px' }}
                    aria-hidden="true"
                  >
                    <input
                      type="text"
                      name="b_5ce5e82d673fd2cfaf12849a5_e85a091ed3"
                      tabIndex={-1}
                    />
                  </div>
                  <div className="clear">
                    <input
                      type="submit"
                      value="Join Waitlist"
                      name="subscribe"
                      id="mc-embedded-subscribe"
                      className="font-medium text-base bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 cursor-pointer"
                      readOnly
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
        <section className="w-10/12 mx-auto mb-24">
          <h2 className="font-bold text-3xl mb-4 text-center">How it works</h2>
          <p className="text-lg font-landing text-gray-500 text-center">
            Put your cryptoassets to work
          </p>
          <div className="w-11/12 mx-auto justify-between flex flex-col space-y-12 mt-12">
            <div className="flex-grow-0 flex-shrink-0 h-104 rounded-xl shadow-2xl flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-primary mt-12 flex items-center">
                <img
                  src="/images/metamaskCat.svg"
                  alt="metamaskCat"
                  className="mx-auto mb-1"
                ></img>
              </div>
              <h3 className="font-medium text-2xl pt-8 py-4">Connect</h3>
              <p className="w-3/4 text-center text-lg text-gray-500">
                Connect your Metamask wallet with Popcorn
              </p>
            </div>

            <div className="flex-grow-0 flex-shrink-0 h-104 rounded-xl shadow-2xl flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-primary mt-12 flex items-center">
                <img
                  src="/images/vault.svg"
                  alt="vault"
                  className="mx-auto mb-2"
                ></img>
              </div>
              <h3 className="font-medium text-2xl pt-8 py-4">Deposit</h3>
              <p className="w-3/4 text-center text-lg text-gray-500">
                Deposit your crypto and choose a product or strategy
              </p>
            </div>
            <div className="flex-grow-0 flex-shrink-0 h-104 rounded-xl shadow-2xl flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-primary mt-12 flex items-center">
                <img
                  src="/images/popcornVault.svg"
                  alt="popcornVault"
                  className="mx-auto mt-2"
                ></img>
              </div>
              <h3 className="font-medium text-2xl pt-8 py-4">Do well</h3>
              <p className="w-3/4 text-center text-lg text-gray-500">
                Earn competitive returns on your crypto assets
              </p>
            </div>

            <div className="flex-grow-0 flex-shrink-0 h-104 rounded-xl shadow-2xl flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-primary mt-12 flex items-center">
                <img
                  src="/images/catMail.svg"
                  alt="catMail"
                  className="mx-auto mb-1"
                ></img>
              </div>
              <h3 className="font-medium text-2xl pt-8 py-4">Do good</h3>
              <p className="w-3/4 text-center text-lg text-gray-500">
                Choose which social impact organization you’d like to help
              </p>
            </div>
          </div>
        </section>
        <section className="w-10/12 h-full mx-auto">
          <Rocket />
          <h2 className="font-bold text-3xl leading-snug mb-4 mt-12 text-center">
            Maximize your Crypto Portfolio
          </h2>
          <p className="text-lg font-landing text-gray-500 text-center">
            Popcorn offers a suite of DeFi products and hedge fund strategies
            for you to generate competitive returns on your crypto assets.
          </p>
        </section>
        <section className="w-10/12 h-full mx-auto mt-24">
          <img src="/images/impact.svg" alt="impact" className=""></img>
          <h2 className="font-bold text-3xl leading-snug mb-4 mt-8 text-center w-10/12 mx-auto">
            Create Real World Impact
          </h2>
          <p className="text-lg font-landing text-gray-500 text-center">
            Our profits fund social impact organizations. Choose which
            initiatives you support:
          </p>
          <div className="w-1/2 mx-auto">
            <ul className="list-inside list-disc mt-8 space-y-2">
              <li className="text-lg font-medium">Environment</li>
              <li className="text-lg font-medium">Open Source</li>
              <li className="text-lg font-medium">Education</li>
            </ul>
          </div>
        </section>
        <section className="w-10/12 h-full mx-auto mt-24">
          <img src="/images/tree.svg" alt="tree" className=""></img>
          <h2 className="font-bold text-3xl leading-snug mb-4 mt-8 text-center w-10/12 mx-auto">
            While Remaining Carbon Neutral
          </h2>
          <p className="text-lg font-landing text-gray-500 text-center">
            Popcorn calculates and neutralizes blockchain carbon emissions by
            partnering with carbon sequestration and negative emission projects.
          </p>
        </section>
        <section>
          <div
            className="bg-countdown-pattern flex-shrink-0 flex-grow-0 w-full
          h-full pt-60"
            style={{
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="w-full pt-32">
              <div className="w-10/12 mx-auto rounded-xl shadow-xl bg-white">
                <h3 className="font-medium text-4xl pt-20 pb-12 text-center">
                  Don’t miss the liquidity event!
                </h3>
                <div className="w-9/12 mx-auto pb-20">
                  <div className="flex flex-row justify-between mb-8">
                    <div className="w-5/12 text-center">
                      <h1 className="font-bold text-7xl leading-snug">
                        {countdown[0]}
                      </h1>
                      <p className="text-3xl font-landing text-gray-500">
                        Days
                      </p>
                    </div>
                    <div className="w-5/12 text-center">
                      <h1 className="font-bold text-7xl leading-snug">
                        {countdown[1]}
                      </h1>
                      <p className="text-3xl font-landing text-gray-500">
                        Hours
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between">
                    <div className="w-5/12 text-center">
                      <h1 className="font-bold text-7xl leading-snug">
                        {countdown[2]}
                      </h1>
                      <p className="text-3xl font-landing text-gray-500">
                        Minutes
                      </p>
                    </div>
                    <div className="w-5/12 text-center">
                      <h1 className="font-bold text-7xl leading-snug">
                        {countdown[3]}
                      </h1>
                      <p className="text-3xl font-landing text-gray-500">
                        Seconds
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-secondary py-24">
          <div className="w-10/12 mx-auto text-center">
            <h2 className="font-bold text-2xl leading-snug mb-4">Notify Me</h2>
            <p className="text-lg">
              Can’t wait to see you when we are launching. Get earlier
              notification to be part of our journey
            </p>
            <form
              action="https://network.us1.list-manage.com/subscribe/post?u=5ce5e82d673fd2cfaf12849a5&amp;id=e85a091ed3"
              method="post"
              id="mc-embedded-subscribe-form"
              name="mc-embedded-subscribe-form"
              className="validate"
              target="_blank"
              noValidate
            >
              <div
                id="mc_embed_signup_scroll"
                className="shadow-xl bg-white rounded-xl py-2 px-2 mt-8 w-full mx-auto flex flex-row items-center justify-between"
              >
                <input
                  type="email"
                  name="EMAIL"
                  className="w-10/12 p-2 text-base mx-4 text-gray-900"
                  id="mce-EMAIL"
                  placeholder="Email Address"
                  required
                />
                <div
                  style={{ position: 'absolute', left: '-5000px' }}
                  aria-hidden="true"
                >
                  <input
                    type="text"
                    name="b_5ce5e82d673fd2cfaf12849a5_e85a091ed3"
                    tabIndex={-1}
                  />
                </div>
                <div className="clear">
                  <input
                    type="submit"
                    value="Join Waitlist"
                    name="subscribe"
                    id="mc-embedded-subscribe"
                    className="font-medium text-base bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 cursor-pointer"
                    readOnly
                  />
                </div>
              </div>
            </form>
          </div>
        </section>
        <section className="w-full bg-secondary">
          <div className="w-10/12 mx-auto">
            <Link href="/" passHref>
              <a>
                {/*TODO The logo is slightly blurred even though its copied straight from figma*/}
                <img
                  src="/images/logo.png"
                  alt="Logo"
                  className="h-10 flex-shrink-0 flex-grow-0"
                ></img>
              </a>
            </Link>
            <p className="font-medium text-base py-4">
              Popcorn is a carbon-neutral crypto savings account where fees fund
              educational, environmental and open source initiatives
            </p>
            <div className="flex flex-row space-x-4 items-center">
              <Link href="https://github.com/popcorndao" passHref>
                <GitHub className="hover:text-blue-600 cursor-pointer" />
              </Link>
              <Link href="https://www.facebook.com/PopcornDAO" passHref>
                <Facebook className="hover:text-blue-600 cursor-pointer" />
              </Link>
              <Link href="https://twitter.com/Popcorn_DAO" passHref>
                <Twitter className="hover:text-blue-600 cursor-pointer" />
              </Link>
              <Link href="https://discord.gg/w9zeRTSZsq" passHref>
                <img
                  src="/images/discord.svg"
                  alt="discord"
                  className="w-8 h-8 cursor-pointer discord"
                ></img>
              </Link>
            </div>
            <div className="flex flex-row justify-evenly py-6">
              <div className="flex flex-col space-y-3 w-1/2">
                <p className="font-medium text-base uppercase">Site</p>
                <Link href="/" passHref>
                  <a className="hover:text-blue-600">Home</a>
                </Link>
                {/*<Link href="/" passHref>
                  <a className="hover:text-blue-600">About us</a>
                </Link>*/}
                <Link href="https://medium.com/popcorndao" passHref>
                  <a className="hover:text-blue-600" target="_window">
                    Blog
                  </a>
                </Link>
                <Link
                  href="https://etherscan.io/token/0xd0cd466b34a24fcb2f87676278af2005ca8a78c4"
                  passHref
                >
                  <a className="hover:text-blue-600" target="_window">
                    Popcorn (POP) Token
                  </a>
                </Link>
              </div>
              <div className="flex flex-col space-y-3 w-1/2">
                <p className="font-medium text-base uppercase">Connect</p>
                <Link href="https://twitter.com/Popcorn_DAO" passHref>
                  <a className="hover:text-blue-600" target="_window">
                    Twitter
                  </a>
                </Link>
                <Link href="https://discord.gg/w9zeRTSZsq" passHref>
                  <a className="hover:text-blue-600" target="_window">
                    Discord
                  </a>
                </Link>
                <Link href="https://github.com/popcorndao" passHref>
                  <a className="hover:text-blue-600" target="_window">
                    Github
                  </a>
                </Link>
              </div>
            </div>
            {/*<div className="flex flex-col space-y-3">
            <p className="font-medium text-base uppercase">Documentation</p>
            <Link href="/" passHref>
              <a className="hover:text-blue-600">Gitbook</a>
            </Link>
          </div>*/}
          </div>
          <div className="w-10/12 border-t border-gray-700 mt-12 mx-auto ">
            <p className="font-base text-center py-4">
              ©2021, Popcorn Network. All Rights Reserved
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IndexPage;
