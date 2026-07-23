<template>
  <Layout class="bg-gray-100">
    <Preheader>
      Verify your email address and start learning on DebSphere Academy.
    </Preheader>

    <Container class="mx-auto max-w-xl py-10">
      <!-- Hero -->
      <Section class="rounded-t-xl bg-[#052073] px-8 py-10">
        <Row>
          <Column>
            <Img src="/logo.png" alt="DebSphere Academy" width="65" />
          </Column>
        </Row>

        <Spacer class="h-10" />

        <Heading class="m-0 text-4xl font-bold text-white">
          Verify your email
        </Heading>

        <Text class="mt-4 text-lg leading-7 text-blue-100">
          Welcome to <strong>DebSphere Academy</strong>. You're just one step
          away from accessing your courses and beginning your learning journey.
        </Text>
      </Section>

      <!-- Body -->
      <Section class="rounded-b-xl bg-white px-8 py-10">
        <Text class="text-base leading-7 text-gray-700">
          Hi <strong>__FIRSTNAME__</strong>,
        </Text>

        <Text class="mt-5 text-base leading-7 text-gray-700">
          Thank you for creating your DebSphere Academy account. To protect your
          account and complete your registration, please verify your email
          address by clicking the button below.
        </Text>

        <Spacer class="h-8" />

        <Button
          href="__VERIFICATIONURL__"
          class="rounded-lg bg-[#052073] px-8 py-4 text-base font-semibold text-white"
        >
          Verify Email Address
        </Button>

        <Spacer class="h-8" />

        <Text class="text-sm leading-6 text-gray-500">
          If the button above doesn't work, copy and paste this link into your
          browser:
        </Text>

        <Text class="break-all text-sm text-[#052073]">
          __VERIFICATIONURL__
        </Text>

        <Spacer class="h-8" />

        <Section class="rounded-lg border border-blue-100 bg-blue-50 p-5">
          <Text class="m-0 text-sm leading-6 text-gray-700">
            <strong>Security Notice</strong><br />
            This verification link will expire in
            <strong>1 hour</strong>. If you did not create a DebSphere Academy
            account, you can safely ignore this email.
          </Text>
        </Section>
      </Section>

      <!-- Footer -->
      <Section class="px-8 py-8">
        <Text class="text-center text-sm text-gray-500">
          Need help? Contact us at

          <Link
            href="mailto:support@debsphereacademy.com"
            class="text-[#052073]"
          >
            support@debsphereacademy.com
          </Link>
        </Text>

        <Spacer class="h-4" />

        <Text class="text-center text-xs text-gray-400">
          © 2026 DebSphere Academy. All rights reserved.
        </Text>
      </Section>
    </Container>
  </Layout>
</template>
