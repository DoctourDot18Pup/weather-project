<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    private const ALLOWED_PROVIDERS = ['google', 'github'];
    private const FRONTEND_URL      = 'http://localhost:5173';

    public function redirect(string $provider)
    {
        if (!in_array($provider, self::ALLOWED_PROVIDERS)) {
            abort(404);
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback(string $provider)
    {
        if (!in_array($provider, self::ALLOWED_PROVIDERS)) {
            abort(404);
        }

        try {
            $social = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception) {
            return redirect(self::FRONTEND_URL . '?auth_error=1');
        }

        $user = User::updateOrCreate(
            ['provider' => $provider, 'provider_id' => $social->getId()],
            [
                'name'   => $social->getName() ?? $social->getNickname() ?? 'Usuario',
                'email'  => $social->getEmail() ?? "{$social->getId()}@{$provider}.oauth",
                'avatar' => $social->getAvatar(),
            ]
        );

        $token = $user->createToken('oauth')->plainTextToken;

        return redirect(self::FRONTEND_URL . '?token=' . $token);
    }

    public function me(Request $request)
    {
        return response()->json([
            'id'       => $request->user()->id,
            'name'     => $request->user()->name,
            'email'    => $request->user()->email,
            'avatar'   => $request->user()->avatar,
            'provider' => $request->user()->provider,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }
}
