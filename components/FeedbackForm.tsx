"use client";

import emailjs from '@emailjs/browser';
import { useRef, useState } from 'react';

import useAlert from '@/hooks/useAlert';
import Alert from '@/components/Alert';
import Image from 'next/image';

const Contact = () => {
  const formRef = useRef<HTMLFormElement | null>(null);

  const { alert, showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };



  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? '',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? '',
        {
          from_name: form.name,
          to_name: 'Emmanuel Oshakpemeh',
          from_email: form.email,
          to_email: 'imacul77@gmail.com',
          message: form.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? '',
      )
      .then(
        () => {
          setLoading(false);
          showAlert({
            show: true,
            text: 'Thank you for your message 😃. We just received it. 🎉',
            type: 'success',
          });

          setTimeout(() => {
            hideAlert();
            setForm({
              name: '',
              email: '',
              message: '',
            });
          }, 3000);
        },
        (error: Error) => {
          setLoading(false);
          console.error(error);

          showAlert({
            show: true,
            text: "Oops! We didn't receive your message 😢. please check your internet connection and try again.",
            type: 'danger',
          });
        },
      );
  };

  return (
    <section className="c-space my-20" id="contact">
      {alert.show && <Alert {...alert} />}

      <div className="relative min-h-screen flex items-center justify-center flex-col">

        <div className="contact-container">
        <h3 className="head-text">We want to hear from you! 😁</h3>
     <p className="text-sm text-white mt-3">
      Got an idea for a feature you&#39;d like to see on Filmchive? Share your thoughts with us below—we&#39;re always looking to improve and make the site better for you!
    </p>


          <form ref={formRef} onSubmit={handleSubmit} className="mt-12 flex flex-col space-y-7 text-white bg-slate-900 p-8 rounded-lg">
            <label className="space-y-3">
              <span className="field-label">Full Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="search"
                placeholder="ex., John Doe"
              />
            </label>

            <label className="space-y-3">
              <span className="field-label">Email address</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="search"
                placeholder="ex., johndoe@gmail.com"
              />
            </label>

            <label className="space-y-3">
              <span className="field-label">Your message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="search"
                placeholder="Share your thoughts or Feedbacks..."
              />
            </label>

            <button className="field-btn" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}

              <Image src="/arrow-up.png" alt="arrow-up" width={45} height={45} className="field-btn_arrow" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;