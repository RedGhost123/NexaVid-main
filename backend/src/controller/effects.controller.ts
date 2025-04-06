@Post('/apply')
async applyEffect(@Req() req, @Body() body) {
  const { effectId, videoId } = body;
  const user = await this.userService.findById(req.user.id);
  const effect = this.effectService.getEffectById(effectId);

  if (!effect) throw new BadRequestException("Invalid effect.");
  if (user.credits < effect.cost) throw new BadRequestException("Not enough credits.");

  // Deduct credits
  await this.userService.updateCredits(user.id, user.credits - effect.cost);

  // Save effect choice
  await this.videoService.updateVideo(videoId, { effectApplied: effectId });

  return { success: true, message: "Effect applied successfully!" };
}
