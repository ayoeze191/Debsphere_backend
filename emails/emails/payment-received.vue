<template>
  <Layout class="bg-[#FBFAF7]">
    <Preheader>
      Your payment was successful — you're enrolled in __COURSETITLE__.
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
              Payment &middot; Confirmed
            </Text>
          </Column>
        </Row>

        <Spacer class="h-10" />

        <Heading
          class="m-0"
          style="
            font-family: Georgia;
            font-size: 34px;
            font-weight: 700;
            color: #ffffff;
          "
        >
          You're enrolled!
        </Heading>

        <Text class="mt-4 text-base leading-7 text-[#C7D0E8]">
          Your payment has been confirmed and you now have full access to
          <strong class="text-white">__COURSETITLE__</strong>.
        </Text>
      </Section>

      <!-- thin accent line under the hero — decorative only -->
      <Section class="bg-[#1AE184] px-0 py-0">
        <Spacer class="h-1" />
      </Section>

      <!-- Body -->
      <Section class="border-x border-b border-[#DDE0E8] bg-white px-8 py-10">
        <Text class="text-base leading-7 text-[#354154]">
          Hi <strong class="text-[#10203A]">__FIRSTNAME__</strong>,
        </Text>

        <Text class="mt-5 text-base leading-7 text-[#354154]">
          Thanks for enrolling — you're all set to start learning right away.
          Below is a summary of your purchase for your records.
        </Text>

        <Spacer class="h-8" />

        <!-- Course card -->
        <Section class="border border-[#DDE0E8]">
          <Row>
            <Column class="w-[120px]">
              <Img
                src="__COURSETHUMBNAIL__"
                alt="__COURSETITLE__"
                width="120"
                height="90"
                class="block"
                style="object-fit: cover"
              />
            </Column>
            <Column class="pl-4">
              <Text
                class="m-0 text-[11px] font-mono uppercase tracking-widest text-[#052073]"
              >
                __COURSECATEGORY__
              </Text>
              <Text
                class="m-0 mt-1"
                style="
                  font-family: Georgia, &quot;Times New Roman&quot;, serif;
                  font-size: 17px;
                  font-weight: 700;
                  color: #10203a;
                "
              >
                __COURSETITLE__
              </Text>
              <Text class="m-0 mt-1 text-xs text-[#8A93A2]">
                __LESSONCOUNT__ lessons &middot; Certificate on completion
              </Text>
            </Column>
          </Row>
        </Section>

        <Spacer class="h-8" />

        <!-- Receipt -->
        <Section class="border border-[#DDE0E8] px-6 py-6">
          <Text
            class="m-0 text-[11px] font-mono uppercase tracking-widest text-[#8A93A2]"
          >
            Receipt
          </Text>

          <Spacer class="h-4" />

          <Row>
            <Column>
              <Text class="m-0 text-sm text-[#6B7688]">Course fee</Text>
            </Column>
            <Column align="right">
              <Text
                class="m-0 text-sm text-[#10203A]"
                style="font-family: ui-monospace, Menlo, Consolas, monospace"
              >
                &#8358;__AMOUNT__
              </Text>
            </Column>
          </Row>

          <Spacer class="h-3" />

          <Row>
            <Column>
              <Text class="m-0 text-sm text-[#6B7688]">Reference</Text>
            </Column>
            <Column align="right">
              <Text
                class="m-0 text-xs text-[#10203A]"
                style="font-family: ui-monospace, Menlo, Consolas, monospace"
              >
                __REFERENCE__
              </Text>
            </Column>
          </Row>

          <Spacer class="h-3" />

          <Row>
            <Column>
              <Text class="m-0 text-sm text-[#6B7688]">Date</Text>
            </Column>
            <Column align="right">
              <Text
                class="m-0 text-xs text-[#10203A]"
                style="font-family: ui-monospace, Menlo, Consolas, monospace"
              >
                __PAYMENTDATE__
              </Text>
            </Column>
          </Row>

          <Spacer class="h-5" />

          <Section class="border-t border-[#DDE0E8] pt-5">
            <Row>
              <Column>
                <Text
                  class="m-0 text-[11px] font-mono uppercase tracking-widest text-[#10203A]"
                >
                  Total paid
                </Text>
              </Column>
              <Column align="right">
                <Text
                  class="m-0 text-lg font-semibold text-[#10203A]"
                  style="font-family: ui-monospace, Menlo, Consolas, monospace"
                >
                  &#8358;__AMOUNT__
                </Text>
              </Column>
            </Row>
          </Section>
        </Section>

        <Spacer class="h-8" />

        <Button
          href="__COURSEURL__"
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
          Start Learning
        </Button>

        <Spacer class="h-4" />

        <Text class="text-sm text-[#8A93A2]">
          You can also find this course anytime in your
          <Link href="__MYLEARNINGURL__" class="text-[#052073]">
            My Learning
          </Link>
          dashboard.
        </Text>

        <Spacer class="h-8" />

        <Section class="border border-[#F0B429] bg-[#FFF8E6] p-5">
          <Text class="m-0 text-sm leading-6 text-[#946800]">
            <strong>Keep this email</strong> — it's your receipt for this
            purchase. If anything looks wrong or you didn't make this payment,
            contact support immediately using the reference number above.
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
