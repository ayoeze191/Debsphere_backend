<template>
  <Layout class="bg-[#FBFAF7]">
    <Preheader>
      Verify your email address and start learning on Debsphere Academy.
    </Preheader>

    <Container class="mx-auto max-w-xl py-10">
      <!-- Hero -->
      <Section class="bg-[#052073] px-8 py-10">
        <Row>
          <Column>
            <Img src="/logo.png" alt="Debsphere Academy" width="56" />
          </Column>
          <Column align="right">
            <Text
              class="m-0 inline-block border border-[#1AE184] px-2 py-1 text-[11px] font-mono uppercase tracking-widest text-[#1AE184]"
            >
              Account &middot; Verify Email
            </Text>
          </Column>
        </Row>

        <Spacer class="h-10" />

        <Heading
          class="m-0"
          style="
            font-family: Georgia, &quot;Times New Roman&quot;, serif;
            font-size: 34px;
            font-weight: 700;
            color: #ffffff;
          "
        >
          Verify your email
        </Heading>

        <Text class="mt-4 text-base leading-7 text-[#C7D0E8]">
          Welcome to <strong class="text-white">Debsphere Academy</strong>.
          You're just one step away from accessing your courses and beginning
          your learning journey.
        </Text>
      </Section>

      <!-- thin accent line under the hero — the logo's candlestick green, decorative only -->
      <Section class="bg-[#1AE184] px-0 py-0">
        <Spacer class="h-1" />
      </Section>

      <!-- Body -->
      <Section class="border-x border-b border-[#DDE0E8] bg-white px-8 py-10">
        <Text class="text-base leading-7 text-[#354154]">
          Hi <strong class="text-[#10203A]">__FIRSTNAME__</strong>,
        </Text>

        <Text class="mt-5 text-base leading-7 text-[#354154]">
          Thank you for creating your Debsphere Academy account. To protect your
          account and complete your registration, please verify your email
          address by clicking the button below.
        </Text>

        <Spacer class="h-8" />

        <a
          href="__VERIFICATIONURL__"
          class="bg-[#052073] px-8 py-4 text-base font-semibold text-white"
          style="
            font-family:
              &quot;IBM Plex Mono&quot;, ui-monospace, Menlo, Consolas,
              monospace;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            font-size: 13px;
          "
        >
          Verify Email Address
        </a>

        <Spacer class="h-8" />

        <Text class="text-sm leading-6 text-[#8A93A2]">
          If the button above doesn't work, copy and paste this link into your
          browser:
        </Text>

        <Section class="mt-2 border border-[#DDE0E8] bg-[#FBFAF7] px-4 py-3">
          <Text
            class="m-0 break-all text-[#052073]"
            style="
              font-family: ui-monospace, Menlo, Consolas, monospace;
              font-size: 12px;
            "
          >
            __VERIFICATIONURL__
          </Text>
        </Section>

        <Spacer class="h-8" />

        <Section class="border border-[#F0B429] bg-[#FFF8E6] p-5">
          <Text class="m-0 text-sm leading-6 text-[#946800]">
            <strong>Security notice</strong><br />
            This verification link will expire in
            <strong>1 hour</strong>. If you did not create a Debsphere Academy
            account, you can safely ignore this email.
          </Text>
        </Section>
      </Section>

      <!-- Footer -->
      <Section class="px-8 py-8">
        <Text class="text-center text-sm text-[#8A93A2]">
          Need help? Contact us at
          <Link
            href="mailto:support@debsphereacademy.com"
            class="text-[#052073]"
          >
            support@debsphereacademy.com
          </Link>
        </Text>

        <Spacer class="h-4" />

        <Text
          class="text-center text-[#9AA3B2]"
          style="
            font-family: ui-monospace, Menlo, Consolas, monospace;
            font-size: 11px;
            letter-spacing: 0.03em;
          "
        >
          &copy; 2026 Debsphere Academy. All rights reserved.
        </Text>
      </Section>
    </Container>
  </Layout>
</template>
